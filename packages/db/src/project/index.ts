import { logger } from "@truffle/db/logger";
const debug = logger("db:project");

import type { Provider } from "web3/providers";
import { WorkflowCompileResult } from "@truffle/compile-common";
import { ContractObject } from "@truffle/contract-schema/spec";

import * as Meta from "@truffle/db/meta";
import * as _Batch from "@truffle/db/batch";
import * as Process from "@truffle/db/process";
import {
  Db,
  NamedCollectionName,
  Input,
  IdObject
} from "@truffle/db/resources";

import { generateInitializeLoad } from "./initialize";
import { generateNamesLoad } from "./names";
import { Compilation, Contract, generateCompileLoad } from "./compile";
import { Artifact, generateMigrateLoad } from "./migrate";

/**
 * Abstraction to integrate with Truffle projects
 *
 * Truffle concepts such as compilation results and migrated artifacts.
 */
export class Project {
  /**
   * Construct abstraction and idempotentally add a project resource
   *
   * @category Constructor
   */
  static async initialize(options: {
    db: Db;
    project: Input<"projects">;
  }): Promise<Project> {
    const { db, project: input } = options;

    const { run, forProvider } = Process.Run.forDb(db);

    const project = await run(generateInitializeLoad, input);

    return new Project({ run, forProvider, project });
  }

  public get id(): string {
    return this.project.id;
  }

  /**
   * Accept a compilation result and process it to save all relevant resources
   * (Source, Bytecode, Compilation, Contract)
   * @category Truffle-specific
   */
  async loadCompile(options: {
    result: WorkflowCompileResult;
  }): Promise<{
    compilations: Compilation[];
    contracts: Contract[];
  }> {
    const { result } = options;

    return await this.run(generateCompileLoad, result);
  }

  /**
   * Update name pointers for this project. Currently affords name-keeping for
   * Network and Contract resources (e.g., naming ContractInstance resources
   * is not supported directly)
   *
   * This saves [[DataModel.NameRecord | NameRecord]] and
   * [[DataModel.ProjectName | ProjectName]] resources to @truffle/db.
   *
   * Returns a list NameRecord resources for completeness, although these may
   * be regarded as an internal concern. ProjectName resources are not returned
   * because they are mutable; returned representations would be impermanent.
   *
   * @typeParam N
   * Either `"contracts"`, `"networks"`, or `"contracts" | "networks"`.
   *
   * @param options.assignments
   * Object whose keys belong to the set of named collection names and whose
   * values are [[IdObject | IdObjects]] for resources of that collection.
   *
   * @example
   * ```typescript
   * await project.assignNames({
   *   assignments: {
   *     contracts: [
   *       { id: "<contract1-id>" },
   *       { id: "<contract2-id>" },
   *       // ...
   *     }
   *   }
   * });
   * ```
   */
  async assignNames<N extends NamedCollectionName>(options: {
    assignments: {
      [K in N]: IdObject<K>[];
    };
  }): Promise<{
    assignments: {
      [K in N]: IdObject<"nameRecords">[];
    };
  }> {
    const { assignments } = await this.run(generateNamesLoad, {
      project: this.project,
      assignments: options.assignments
    });
    return {
      // @ts-ignore
      assignments: Object.entries(assignments)
        .map(([collectionName, assignments]) => ({
          [collectionName]: assignments.map(({ nameRecord }) => nameRecord)
        }))
        .reduce((a, b) => ({ ...a, ...b }), {})
    };
  }

  /**
   * Accept a provider to enable workflows that require communicating with the
   * underlying blockchain network.
   * @category Constructor
   */
  connect(options: { provider: Provider }): Project.ConnectedProject {
    const { run } = this.forProvider(options.provider);

    return new Project.ConnectedProject({
      run,
      project: this.project
    });
  }

  /**
   * Run a given [[Process.Processor | Processor]] with specified arguments.
   *
   * This method is a [[Meta.Process.ProcessorRunner | ProcessorRunner]] and
   * can be used to `await` (e.g.) the processors defined by
   * [[Process.resources | Process's `resources`]].
   *
   * @category Processor
   */
  async run<
    A extends unknown[],
    T = any,
    R extends Process.RequestType | undefined = undefined
  >(processor: Process.Processor<A, T, R>, ...args: A): Promise<T> {
    return this._run(processor, ...args);
  }

  /*
   * internals
   */

  /**
   * @hidden
   */
  private forProvider: (provider: Provider) => { run: Process.ProcessorRunner };
  /**
   * @hidden
   */
  private project: IdObject<"projects">;
  /**
   * @hidden
   */
  private _run: Process.ProcessorRunner;

  /**
   * @ignore
   */
  protected constructor(options: {
    project: IdObject<"projects">;
    run: Process.ProcessorRunner;
    forProvider?: (provider: Provider) => { run: Process.ProcessorRunner };
  }) {
    this.project = options.project;
    this._run = options.run;
    if (options.forProvider) {
      this.forProvider = options.forProvider;
    }
  }
}

export namespace Project {
  export class ConnectedProject extends Project {
    /**
     * Process artifacts after a migration. Uses provider to determine most
     * relevant network information directly, but still requires project-specific
     * information about the network (i.e., name)
     *
     * This adds potentially multiple Network resources to @truffle/db, creating
     * individual networks for the historic blocks in which each ContractInstance
     * was first created on-chain.
     *
     * This saves Network and ContractInstance resources to @truffle/db.
     *
     * Returns both a list of ContractInstances and the Network added with the
     * highest block height.
     * @category Truffle-specific
     */
    async loadMigrate(options: {
      network: Omit<Input<"networks">, "networkId" | "historicBlock">;
      artifacts: ContractObject[];
    }): Promise<{
      network: IdObject<"networks">;
      artifacts: Artifact[];
    }> {
      return await this.run(generateMigrateLoad, options);
    }
  }

  export namespace Batch {
    export type Configure = <B extends Batch>(
      options: Options<B>
    ) => <I extends Input<B>, O extends Output<B>>(
      inputs: Inputs<B, I>
    ) => Process.Process<Outputs<B, O>>;

    export const configure: Configure = Meta.Batch.configure;

    export type Batch = Meta.Batch.Batch;
    export type Options<B extends Meta.Batch.Batch> = Meta.Batch.Options<B>;
    export type Input<B extends Meta.Batch.Batch> = Meta.Batch.Input<B>;
    export type Inputs<
      B extends Meta.Batch.Batch,
      I extends Input<B>
    > = Meta.Batch.Inputs<B, I>;
    export type Output<B extends Meta.Batch.Batch> = Meta.Batch.Output<B>;
    export type Outputs<
      B extends Meta.Batch.Batch,
      O extends Output<B>
    > = Meta.Batch.Outputs<B, O>;
  }
}
