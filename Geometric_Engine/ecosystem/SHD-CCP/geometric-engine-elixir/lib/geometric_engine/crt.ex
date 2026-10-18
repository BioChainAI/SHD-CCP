defmodule GeometricEngine.Crt do
  @moduledoc "Closed-form Garner CRT over (881, 883, 887) (RFC 02)."

  @m 690_017_701
  # 881^-1 mod 883 and (881 * 883)^-1 mod 887
  @c12 441
  @c123 37

  def modulus, do: @m

  @spec encode(non_neg_integer()) :: {non_neg_integer(), non_neg_integer(), non_neg_integer()}
  def encode(n) when is_integer(n) and n >= 0 and n < @m,
    do: {rem(n, 881), rem(n, 883), rem(n, 887)}

  @spec decode({non_neg_integer(), non_neg_integer(), non_neg_integer()}) :: non_neg_integer()
  def decode({r1, r2, r3})
      when r1 in 0..880 and r2 in 0..882 and r3 in 0..886 do
    v2 = Integer.mod((r2 - r1) * @c12, 883)
    v3 = Integer.mod((r3 - r1 - 881 * v2) * @c123, 887)
    r1 + 881 * v2 + 777_923 * v3
  end
end
