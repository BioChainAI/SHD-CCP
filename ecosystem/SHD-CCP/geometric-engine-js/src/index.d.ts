export declare const SPEC_VERSION: string;

export declare namespace tile {
  const TILE_MASK: bigint;
  const FORM_ID_SHIFT: bigint;
  const FORM_ID_MASK: bigint;
  const SOUTH_HALO_SHIFT: bigint;
  const SOUTH_HALO_MASK: bigint;
  const PAYLOAD_MASK: bigint;
  function formId(tile: bigint): number;
  function southHalo(tile: bigint): number;
  function payload(tile: bigint): bigint;
  function pack(formId: number, southHalo: number, payload: bigint): bigint;
}

export declare namespace crt {
  const MODULI: readonly [881, 883, 887];
  const M: 690017701;
  function encode(n: number): [number, number, number];
  function decode(residues: readonly [number, number, number]): number;
}

export declare namespace tqf {
  type Point = readonly [number | bigint, number | bigint];
  function gramTqf(p1: Point, p2: Point, p3: Point): bigint;
  function isCollinear(p1: Point, p2: Point, p3: Point): boolean;
}
