/**
 * Contains the types for error and `ErrorResult` objects.
 * @category Main Format
 *
 * @packageDocumentation
 */
import debugModule from "debug";
const debug = debugModule("codec:format:errors");

//error counterpart to values.ts

//Note: Many of the errors defined here deliberately *don't* extend Error.
//This is because they're not for throwing.  If you want to throw one,
//wrap it in a DecodingError.

import BN from "bn.js";
import * as Types from "./types";
import { Config, DefaultConfig } from "./config";
import * as Storage from "./storage";
import * as Ast from "@truffle/codec/ast/types";
import { PaddingType } from "@truffle/codec/common";

/*
 * SECTION 1: Generic types for values in general (including errors).
 */

/**
 * A result which is an error rather than a value
 *
 * @Category General categories
 */
export type ErrorResult<
  C extends Config = DefaultConfig
> =
  | ElementaryErrorResult<C>
  | ArrayErrorResult<C>
  | MappingErrorResult<C>
  | StructErrorResult<C>
  | MagicErrorResult<C>
  | TypeErrorResult<C>
  | TupleErrorResult<C>
  | FunctionExternalErrorResult<C>
  | FunctionInternalErrorResult<C>;

/**
 * One of the underlying errors contained in an [[ErrorResult]]
 *
 * @Category General categories
 */
export type DecoderError<
  C extends Config = DefaultConfig
> =
  | GenericError<C>
  | UintError<C>
  | IntError<C>
  | BoolError<C>
  | BytesStaticError<C>
  | BytesDynamicError<C>
  | AddressError<C>
  | StringError<C>
  | FixedError<C>
  | UfixedError<C>
  | ArrayError<C>
  | MappingError<C>
  | StructError<C>
  | MagicError<C>
  | TypeErrorUnion<C>
  | TupleError<C>
  | EnumError<C>
  | ContractError<C>
  | FunctionExternalError<C>
  | FunctionInternalError<C>
  | InternalUseError<C>;

/*
 * SECTION 2: Built-in elementary types
 */

/**
 * An error result for an elementary value
 *
 * @Category Elementary types
 */
export type ElementaryErrorResult<
  C extends Config = DefaultConfig
> =
  | UintErrorResult<C>
  | IntErrorResult<C>
  | BoolErrorResult<C>
  | BytesErrorResult<C>
  | AddressErrorResult<C>
  | StringErrorResult<C>
  | FixedErrorResult<C>
  | UfixedErrorResult<C>
  | EnumErrorResult<C>
  | ContractErrorResult<C>;

/**
 * An error result for a bytestring
 *
 * @Category Elementary types
 */
export type BytesErrorResult<
  C extends Config = DefaultConfig
> = BytesStaticErrorResult<C> | BytesDynamicErrorResult<C>;

/**
 * An error result for an unsigned integer
 *
 * @Category Elementary types
 */
export interface UintErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.UintType<C>;
  kind: "error";
  error: GenericError<C> | UintError<C>;
}

/**
 * A uint-specific error
 *
 * @Category Elementary types
 */
export type UintError<
  C extends Config = DefaultConfig
> = UintPaddingError<C>;

/**
 * A padding error for an unsigned integer (note padding is not always checked)
 *
 * @Category Elementary types
 */
export interface UintPaddingError<
  _C extends Config = DefaultConfig
> {
  /**
   * hex string
   */
  raw: string;
  kind: "UintPaddingError";
  paddingType: PaddingType;
}

/**
 * An error result for a signed integer
 *
 * @Category Elementary types
 */
export interface IntErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.IntType<C>;
  kind: "error";
  error: GenericError<C> | IntError<C>;
}

/**
 * An int-specific error
 *
 * @Category Elementary types
 */
export type IntError<
  C extends Config = DefaultConfig
> = IntPaddingError<C>;

/**
 * A padding error for a signed integer (note padding is not always checked)
 *
 * @Category Elementary types
 */
export interface IntPaddingError<_C> {
  /**
   * hex string
   */
  raw: string;
  kind: "IntPaddingError";
  paddingType: PaddingType;
}

/**
 * An error result for a boolean
 *
 * @Category Elementary types
 */
export interface BoolErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.BoolType<C>;
  kind: "error";
  error: GenericError<C> | BoolError<C>;
}

/**
 * A bool-specific error
 *
 * @Category Elementary types
 */
export type BoolError<
  C extends Config = DefaultConfig
> = BoolOutOfRangeError<C> | BoolPaddingError<C>;

/**
 * The bool is neither 0 nor 1
 *
 * @Category Elementary types
 */
export type BoolOutOfRangeError<
  C extends Config = DefaultConfig
> = BoolOutOfRangeErrorBaseFields & RawIntegerFields[C["integerType"]];

export interface BoolOutOfRangeErrorBaseFields {
  kind: "BoolOutOfRangeError";
}

interface RawIntegerFields {
  BN: {
    rawAsBN: BN;
  };
  string: {
    rawAsString: string;
  };
}

/**
 * A padding error for a boolean
 *
 * @Category Elementary types
 */
export interface BoolPaddingError<
  _C extends Config = DefaultConfig
> {
  /**
   * hex string
   */
  raw: string;
  kind: "BoolPaddingError";
  paddingType: PaddingType;
}

/**
 * An error result for a static-length bytestring
 *
 * @Category Elementary types
 */
export interface BytesStaticErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.BytesTypeStatic<C>;
  kind: "error";
  error: GenericError<C> | BytesStaticError<C>;
}

/**
 * A static-bytestring-specific error
 *
 * @Category Elementary types
 */
export type BytesStaticError<C> = BytesPaddingError<C>;

/**
 * A padding error for a static-length bytestring (note padding is not always checked)
 *
 * @Category Elementary types
 */
export interface BytesPaddingError<_C> {
  /**
   * hex string
   */
  raw: string;
  kind: "BytesPaddingError";
  paddingType: PaddingType;
}

/**
 * An error result for a dynamic-length bytestring
 *
 * @Category Elementary types
 */
export interface BytesDynamicErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.BytesTypeDynamic<C>;
  kind: "error";
  error: GenericError<C> | BytesDynamicError<C>;
}

/**
 * A dynamic-bytestring-specific error
 *
 * @Category Elementary types
 */
export type BytesDynamicError<
  C extends Config = DefaultConfig
> = DynamicDataImplementationError<C>;

/**
 * An error result for an address
 *
 * @Category Elementary types
 */
export interface AddressErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.AddressType<C>;
  kind: "error";
  error: GenericError<C> | AddressError<C>;
}

/**
 * A address-specific error
 *
 * @Category Elementary types
 */
export type AddressError<
  C extends Config = DefaultConfig
> = AddressPaddingError<C>;

/**
 * A padding error for an address (note padding is not always checked)
 *
 * @Category Elementary types
 */
export interface AddressPaddingError<
  _C extends Config = DefaultConfig
> {
  /**
   * hex string; no checksum
   */
  raw: string;
  kind: "AddressPaddingError";
  paddingType: PaddingType;
}

/**
 * An error result for a string
 *
 * @Category Elementary types
 */
export interface StringErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.StringType<C>;
  kind: "error";
  error: GenericError<C> | StringError<C>;
}

/**
 * A string-specific error
 *
 * @Category Elementary types
 */
export type StringError<
  C extends Config = DefaultConfig
> = DynamicDataImplementationError<C>;

/**
 * An error result for a signed fixed-point number
 *
 * @Category Elementary types
 */
export interface FixedErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.FixedType<C>;
  kind: "error";
  error: GenericError<C> | FixedError<C>;
}
/**
 * An error result for an unsigned fixed-point number
 *
 * @Category Elementary types
 */
export interface UfixedErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.UfixedType<C>;
  kind: "error";
  error: GenericError<C> | UfixedError<C>;
}

/**
 * A fixed-specific error
 *
 * @Category Elementary types
 */
export type FixedError<
  C extends Config = DefaultConfig
> = FixedPaddingError<C>;

/**
 * A padding error for a signed fixed-point number (note padding is not always checked)
 *
 * @Category Elementary types
 */
export interface FixedPaddingError<
  _C extends Config = DefaultConfig
> {
  /**
   * hex string
   */
  raw: string;
  kind: "FixedPaddingError";
  paddingType: PaddingType;
}

/**
 * A ufixed-specific error
 *
 * @Category Elementary types
 */
export type UfixedError<
  C extends Config = DefaultConfig
> = UfixedPaddingError<C>;

/**
 * A padding error for an unsigned fixed-point number (note padding is not always checked)
 *
 * @Category Elementary types
 */
export interface UfixedPaddingError<
  _C extends Config = DefaultConfig
> {
  /**
   * hex string
   */
  raw: string;
  kind: "UfixedPaddingError";
  paddingType: PaddingType;
}

/*
 * SECTION 3: User-defined elementary types
 */

/**
 * An error result for an enum
 *
 * @Category User-defined elementary types
 */
export interface EnumErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.EnumType<C>;
  kind: "error";
  error: GenericError<C> | EnumError<C>;
}

/**
 * An enum-specific error
 *
 * @Category User-defined elementary types
 */
export type EnumError<
  C extends Config = DefaultConfig
> = EnumOutOfRangeError<C> | EnumPaddingError<C> | EnumNotFoundDecodingError<C>;

/**
 * The enum is out of range
 *
 * @Category User-defined elementary types
 */
export type EnumOutOfRangeError<
  C extends Config = DefaultConfig
> = EnumOutOfRangeErrorBaseFields<C> & RawIntegerFields[C["integerType"]];

interface EnumOutOfRangeErrorBaseFields<
  C extends Config = DefaultConfig
> {
  kind: "EnumOutOfRangeError";
  type: Types.EnumType<C>;
}

/**
 * A padding error for an enum
 *
 * @Category Elementary types
 */
export interface EnumPaddingError<
  _C extends Config = DefaultConfig
> {
  /**
   * hex string
   */
  raw: string;
  type: Types.EnumType;
  kind: "EnumPaddingError";
  paddingType: PaddingType;
}

/**
 * The enum type definition could not be located
 *
 * @Category User-defined elementary types
 */
export type EnumNotFoundDecodingError<
  C extends Config = DefaultConfig
> = EnumNotFoundDecodingErrorBaseFields<C> & RawIntegerFields[C["integerType"]];

interface EnumNotFoundDecodingErrorBaseFields<
  C extends Config = DefaultConfig
> {
  kind: "EnumNotFoundDecodingError";
  type: Types.EnumType<C>;
}

/**
 * An error result for a contract
 *
 * @Category User-defined elementary types
 */
export interface ContractErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.ContractType<C>;
  kind: "error";
  error: GenericError<C> | ContractError<C>;
}

/**
 * A contract-specific error
 *
 * @Category User-defined elementary types
 */
export type ContractError<
  C extends Config = DefaultConfig
> = ContractPaddingError<C>;

/**
 * A padding error for contract (note padding is not always checked)
 *
 * @Category User-defined elementary types
 */
export interface ContractPaddingError<
  _C extends Config = DefaultConfig
> {
  /**
   * hex string
   */
  raw: string;
  kind: "ContractPaddingError";
  paddingType: PaddingType;
}

/*
 * SECTION 4: Container types (including magic)
 */

/**
 * An error result for an array
 *
 * @Category Container types
 */
export interface ArrayErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.ArrayType<C>;
  kind: "error";
  error: GenericError<C> | ArrayError<C>;
}

/**
 * An arrray-specific error
 *
 * @Category Container types
 */
export type ArrayError<
  C extends Config = DefaultConfig
> = DynamicDataImplementationError<C>;

/**
 * An error result for a mapping
 *
 * @Category Container types
 */
export interface MappingErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.MappingType<C>;
  kind: "error";
  error: GenericError<C> | MappingError<C>;
}

/**
 * A mapping-specific error (there are none)
 *
 * @Category Container types
 */
export type MappingError<
  _C extends Config = DefaultConfig
> = never;

/**
 * An error result for a struct
 *
 * @Category Container types
 */
export interface StructErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.StructType<C>;
  kind: "error";
  error: GenericError<C> | StructError<C>;
}

/**
 * A struct-specific error
 *
 * @Category Container types
 */
export type StructError<
  C extends Config = DefaultConfig
> = DynamicDataImplementationError<C>;

/**
 * An error result for a tuple
 *
 * @Category Container types
 */
export interface TupleErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.TupleType<C>;
  kind: "error";
  error: GenericError<C> | TupleError<C>;
}

/**
 * A tuple-specific error
 *
 * @Category Container types
 */
export type TupleError<
  C extends Config = DefaultConfig
> = DynamicDataImplementationError<C>;

/**
 * An error result for a magic variable
 *
 * @Category Special container types (debugger-only)
 */
export interface MagicErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.MagicType<C>;
  kind: "error";
  error: GenericError<C> | MagicError<C>;
}

/**
 * A magic-specific error (there are none)
 *
 * @Category Special container types (debugger-only)
 */
export type MagicError<
  _C extends Config = DefaultConfig
> = never;

/**
 * An error result for a type
 *
 * @Category Special container types (debugger-only)
 */
export interface TypeErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.TypeType<C>;
  kind: "error";
  error: GenericError<C> | TypeErrorUnion<C>;
}

/**
 * An error specific to type values (there are none);
 * this isn't called TypeError because that's not legal
 *
 * @Category Special container types (debugger-only)
 */
export type TypeErrorUnion<
  _C extends Config = DefaultConfig
> = never;

/*
 * SECTION 5: External functions
 */

/**
 * An error result for an external function
 *
 * @Category Function types
 */
export interface FunctionExternalErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.FunctionExternalType<C>;
  kind: "error";
  error: GenericError<C> | FunctionExternalError<C>;
}

/**
 * An external-function specific error
 *
 * @Category Function types
 */
export type FunctionExternalError<
  C extends Config = DefaultConfig
> =
  | FunctionExternalNonStackPaddingError<C>
  | FunctionExternalStackPaddingError<C>;

/**
 * This error kind represents a padding error for an external function pointer located anywhere other than the stack.
 *
 * @Category Function types
 */
export interface FunctionExternalNonStackPaddingError<
  _C extends Config = DefaultConfig
> {
  /**
   * hex string
   */
  raw: string;
  kind: "FunctionExternalNonStackPaddingError";
  paddingType: PaddingType;
}

/**
 * This error kind represents a padding error for external function pointer located on the stack.
 *
 * @Category Function types
 */
export interface FunctionExternalStackPaddingError<
  _C extends Config = DefaultConfig
> {
  /**
   * hex string (no checksum; also a full word long)
   */
  rawAddress: string;
  /**
   * hex string (but a full word long)
   */
  rawSelector: string;
  kind: "FunctionExternalStackPaddingError";
}

/*
 * SECTION 6: Internal functions
 */

/**
 * An error result for an internal function
 *
 * @Category Function types
 */
export interface FunctionInternalErrorResult<
  C extends Config = DefaultConfig
> {
  type: Types.FunctionInternalType<C>;
  kind: "error";
  error: GenericError<C> | FunctionInternalError<C>;
}

/**
 * An internal-function specific error
 *
 * @Category Function types
 */
export type FunctionInternalError<
  C extends Config = DefaultConfig
> =
  | FunctionInternalPaddingError<C>
  | NoSuchInternalFunctionError<C>
  | DeployedFunctionInConstructorError<C>
  | MalformedInternalFunctionError<C>;

/**
 * A padding error for an internal function
 *
 * @Category Function types
 */
export interface FunctionInternalPaddingError<
  _C extends Config = DefaultConfig
> {
  /**
   * hex string
   */
  raw: string;
  kind: "FunctionInternalPaddingError";
  paddingType: PaddingType;
}

/**
 * Indicates that the function pointer being decoded
 * fails to point to a valid function, and also is not one of the
 * default values
 *
 * @Category Function types
 */
export interface NoSuchInternalFunctionError<
  C extends Config = DefaultConfig
> {
  kind: "NoSuchInternalFunctionError";
  context: Types.ContractType<C>;
  deployedProgramCounter: number;
  constructorProgramCounter: number;
}

/**
 * Indicates that this is a deployed-style pointer,
 * despite the fact that you're in a constructor
 *
 * @Category Function types
 */
export interface DeployedFunctionInConstructorError<
  C extends Config = DefaultConfig
> {
  kind: "DeployedFunctionInConstructorError";
  context: Types.ContractType<C>;
  deployedProgramCounter: number;
  constructorProgramCounter: number;
}

/**
 * Used when the deployed PC is zero but the constructor PC
 * is nonzero
 *
 * @Category Function types
 */
export interface MalformedInternalFunctionError<
  C extends Config = DefaultConfig
> {
  kind: "MalformedInternalFunctionError";
  context: Types.ContractType<C>;
  deployedProgramCounter: number;
  constructorProgramCounter: number;
}

/*
 * SECTION 7: Generic errors
 */

/**
 * A type-non-specific error
 *
 * @Category Generic errors
 */
export type GenericError<
  C extends Config = DefaultConfig
> =
  | UserDefinedTypeNotFoundError<C>
  | IndexedReferenceTypeError<C>
  | ReadError<C>;
/**
 * A read error
 *
 * @Category Generic errors
 */
export type ReadError<
  C extends Config = DefaultConfig
> =
  | UnsupportedConstantError<C>
  | ReadErrorStack<C>
  | ReadErrorBytes<C>
  | ReadErrorStorage<C>
  | UnusedImmutableError<C>;
/**
 * An error resulting from overlarge length or pointer values
 *
 * @Category Generic errors
 */
export type DynamicDataImplementationError<
  C extends Config = DefaultConfig
> =
  | OverlongArraysAndStringsNotImplementedError<C>
  | OverlargePointersNotImplementedError<C>;

/**
 * An error that may occur in a component other than the main
 * core of the decoder itself and thus may need to get thrown to it
 *
 * @Category Generic errors
 */
export type ErrorForThrowing<
  C extends Config = DefaultConfig
> = UserDefinedTypeNotFoundError<C> | ReadError<C>;

/**
 * Used when decoding an indexed parameter of reference (or tuple) type.  These
 * can't meaningfully be decoded, so instead they decode to an error, sorry.
 *
 * @Category Generic errors
 */
export interface IndexedReferenceTypeError<
  C extends Config = DefaultConfig
> {
  kind: "IndexedReferenceTypeError";
  type: Types.ReferenceType<C> | Types.TupleType<C>;
  /**
   * hex string
   */
  raw: string;
}

/**
 * An error for when can't find the definition info for a user-defined type
 *
 * @Category Generic errors
 */
export interface UserDefinedTypeNotFoundError<
  C extends Config = DefaultConfig
> {
  kind: "UserDefinedTypeNotFoundError";
  type: Types.UserDefinedType<C>;
}

/**
 * An error for an unsupported type of constant (this counts as a read error)
 *
 * @Category Generic errors
 */
export interface UnsupportedConstantError<
  _C extends Config = DefaultConfig
> {
  kind: "UnsupportedConstantError";
  definition: Ast.AstNode;
}

/**
 * Read error on the stack
 *
 * @Category Generic errors
 */
export interface ReadErrorStack<
  _C extends Config = DefaultConfig
> {
  kind: "ReadErrorStack";
  from: number;
  to: number;
}

/**
 * A byte-based location
 */
export type BytesLocation =
  | "memory"
  | "calldata"
  | "eventdata"
  | "returndata"
  | "code";

/**
 * Read error in a byte-based location (memory, calldata, etc)
 *
 * @Category Generic errors
 */
export interface ReadErrorBytes<
  _C extends Config = DefaultConfig
> {
  kind: "ReadErrorBytes";
  location: BytesLocation;
  start: number;
  length: number;
}

/**
 * Read error in storage
 *
 * @Category Generic errors
 */
export interface ReadErrorStorage<
  C extends Config = DefaultConfig
> {
  kind: "ReadErrorStorage";
  range: Storage.Range<C>;
}

/**
 * Attempting to read an immutable that is never stored anywhere
 *
 * @Category Generic errors
 */
export interface UnusedImmutableError<
  _C extends Config = DefaultConfig
> {
  kind: "UnusedImmutableError";
}

/**
 * Error for array/string/bytestring having length bigger than a JS number
 *
 * @Category Generic errors
 */
export type OverlongArraysAndStringsNotImplementedError<
  C extends Config = DefaultConfig
> = OverlongArraysAndStringsNotImplementedErrorBaseFields &
  LengthIntegerFields[C["integerType"]];

interface OverlongArraysAndStringsNotImplementedErrorBaseFields {
  kind: "OverlongArraysAndStringsNotImplementedError";
  dataLength?: number; //only included when the special strict mode check fails
}

interface LengthIntegerFields {
  BN: {
    lengthAsBN: BN;
  };
  string: {
    lengthAsString: string;
  };
}

/**
 * Error for dynamic type being represented by pointer bigger than a JS number
 *
 * @Category Generic errors
 */
export type OverlargePointersNotImplementedError<
  C extends Config = DefaultConfig
> = OverlargePointersNotImplementedErrorBaseFields &
  PointerIntegerFields[C["integerType"]];

interface OverlargePointersNotImplementedErrorBaseFields {
  kind: "OverlargePointersNotImplementedError";
  pointerAsBN: BN;
}

interface PointerIntegerFields {
  BN: {
    pointerAsBN: BN;
  };
  string: {
    pointerAsString: string;
  };
}

/* SECTION 8: Internal use errors */
/* you should never see these returned.
 * they are only for internal use. */

/**
 * Internal-use error
 *
 * @Category Internal-use errors
 */
export type InternalUseError<
  C extends Config = DefaultConfig
> = OverlongArrayOrStringStrictModeError<C> | InternalFunctionInABIError<C>;

/**
 * Error for the stricter length check in strict mode
 *
 * @Category Internal-use errors
 */
export type OverlongArrayOrStringStrictModeError<
  C extends Config = DefaultConfig
> = OverlongArrayOrStringStrictModeErrorBaseFields &
  LengthIntegerFields[C["integerType"]];

interface OverlongArrayOrStringStrictModeErrorBaseFields<
  _C extends Config = DefaultConfig
> {
  kind: "OverlongArrayOrStringStrictModeError";
  dataLength: number;
}

/**
 * This should never come up, but just to be sure...
 *
 * @Category Internal-use errors
 */
export interface InternalFunctionInABIError<
  _C extends Config = DefaultConfig
> {
  kind: "InternalFunctionInABIError";
}
