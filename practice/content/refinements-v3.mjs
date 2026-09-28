const R=String.raw;
export function refineChapter1(q){
 if(q.questionId==='1-2-q5')return {...q,prompt:R`Find all real values of \(x\) for which
\[
-7\le\frac{5-3x}{2}+3t<11
\]
holds for **every real \(t\) in \([0,1]\)**.`,
 explanation:R`**Correct Answer:** A

#### Work

Let \(u=(5-3x)/2\). As \(t\) moves from 0 to 1, \(u+3t\) increases from \(u\) to \(u+3\). Therefore the lower bound must hold at \(t=0\), and the upper bound must hold at \(t=1\):
\[
u\ge-7,\qquad u+3<11.
\]
These give \(-7\le(5-3x)/2<8\). Multiply by 2 and subtract 5:
\[
-19\le-3x<11.
\]
Dividing by −3 reverses the signs, so
\[
-\frac{11}{3}<x\le\frac{19}{3}.
\]
#### Explanation

The smallest and largest parameter values control different sides of the compound inequality. Because the expression increases in t, satisfying those two endpoint tests is sufficient for every intermediate t. The solution is \((-11/3,19/3]\).`,depth:'Universal parameter over a closed interval; separate worst-case bounds and endpoint inclusion.'};
 if(q.questionId==='1-6-q5')return {...q,prompt:R`A well-mixed 42-liter batch has an unknown acid concentration between 60% and 65%, inclusive. A chemist removes r liters and replaces them with r liters of 30% solution. Find the **smallest** replacement volume that guarantees a final concentration of at most 50% for every possible starting concentration, and the volume of original solution that remains.`,
 choices:[{letter:'A',text:'18 L replaced; 24 L of original solution remain'},{letter:'B',text:'24 L replaced; 18 L of original solution remain'},{letter:'C',text:'21 L replaced; 21 L of original solution remain'},{letter:'D',text:'12 L replaced; 30 L of original solution remain'}],
 explanation:R`**Correct Answer:** A

#### Work

Let p be the original concentration as a decimal, so \(0.60\le p\le0.65\). After replacement, the acid amount is
\[
p(42-r)+0.30r.
\]
Because \(0\le r\le42\), the largest possible acid amount occurs at \(p=0.65\). The guarantee therefore requires
\[
0.65(42-r)+0.30r\le0.50(42).
\]
This simplifies to \(27.3-0.35r\le21\), or \(r\ge18\). The smallest replacement is 18 liters; 24 liters of original solution remain.

At the worst starting concentration, the final acid amount is \(0.65(24)+0.30(18)=21\) liters, exactly 50% of 42 liters. For any smaller p the final concentration is lower.

#### Explanation

The unknown starting concentration calls for a worst-case argument. Larger replacement volumes also meet the concentration limit, but they do not satisfy the requirement that the replacement be the smallest possible.`,depth:'Worst-case concentration, conservation of volume and substance, and proof of a minimum guarantee.'};
 if(q.questionId==='1-8-q3')return {...q,prompt:R`Minimize
\[
C=4x+7y
\]
subject to
\[
x\ge0,\quad y\ge0,\quad 2x+y\ge8,\quad x+3y\ge9,\quad x+y\le7.
\]
Which result is correct?`,explanation:R`**Correct Answer:** C

#### Work

Find the intersections of the three non-axis boundaries. Solving them in pairs gives
\[
(1,6),\qquad(3,2),\qquad(6,1).
\]
Each satisfies all the inequalities, and the constraints enclose the triangle with these vertices. Neither axis contributes a feasible boundary segment: at x = 0 the lower bound y ≥ 8 conflicts with y ≤ 7; at y = 0 the lower bound x ≥ 9 conflicts with x ≤ 7.

Evaluate the objective:
\[
C(1,6)=46,\quad C(3,2)=26,\quad C(6,1)=31.
\]
The minimum is 26 at (3, 2).

#### Explanation

The boundary directions determine a bounded feasible triangle. Computing candidate intersections alone is not enough: verify their feasibility before comparing objective values. Choice C gives the smallest attainable value.`,depth:'Derive a feasible triangle from mixed inequality directions before optimizing.'};
 return q;
}
