defmodule GeometricEngine.Tqf do
  @moduledoc """
  Exact Gram-TQF collinearity (RFC 02). BEAM integers are arbitrary precision,
  so `A = (Q1+Q2+Q3)^2 - 2(Q1^2+Q2^2+Q3^2)` never rounds.
  """

  @type point :: {integer(), integer()}

  @spec gram_tqf(point(), point(), point()) :: non_neg_integer()
  def gram_tqf(p1, p2, p3) do
    {q1, q2, q3} = {quadrance(p2, p3), quadrance(p1, p3), quadrance(p1, p2)}
    s = q1 + q2 + q3
    s * s - 2 * (q1 * q1 + q2 * q2 + q3 * q3)
  end

  @spec collinear?(point(), point(), point()) :: boolean()
  def collinear?(p1, p2, p3), do: gram_tqf(p1, p2, p3) == 0

  defp quadrance({ax, ay}, {bx, by}) do
    {dx, dy} = {ax - bx, ay - by}
    dx * dx + dy * dy
  end
end
