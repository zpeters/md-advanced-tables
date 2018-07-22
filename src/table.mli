(** *)

(** Table.t represents a table, consists of a header, body rows, and alignment
    specifications of columns. A table may not have the normalized form i.e. it can be empty, or
    can have inconsistent number of columns, etc.
    @see <./Table.Normalized.html> Table.Normalized.t
*)
type t

(** Creates a table. *)
val create: header:string list option -> body:string list list -> alignments:Alignment.t option list -> t

(** Gets the header of the given table. *)
val header: t -> string list option

(** Gets the body of the given table. *)
val body: t -> string list list

(** Gets the alignment specifications of the given table. *)
val alignments: t -> Alignment.t option list

module Normalized: sig
  (** Normalized.t represents a table that have the "normalized form" defined as follows:

      - It must have at least one row including header.
      - It must have at least one column.
      - All of the rows must have the same width, and it must have the correct number of alignment
        specifications.
  *)
  type t

  (** Creates a normalized table. It checks dynamically the given arguments are vaild, and fails if
      they are not. *)
  val create: header:string list option -> body:string list list -> alignments:Alignment.t option list -> t

  (** Gets the header of the given table. *)
  val header: t -> string list option

  (** Gets the body of the given table. *)
  val body: t -> string list list

  (** Gets the alignment specifications of the given table. *)
  val alignments: t -> Alignment.t option list

  (** Gets the width (number of the columns) of the given table. *)
  val width: t -> int
end
