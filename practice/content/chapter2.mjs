// Original Chapter 2 questions aligned to the supplied 2018 lesson sequence.
const R=String.raw;
const number=(key,label,value)=>({key,label,type:'number',value:String(value),hint:'Numbers, fractions, and equivalent arithmetic expressions are accepted.'});
const interval=value=>({key:'interval',label:'Solution interval',type:'interval',value,hint:'Use [ ] for included endpoints and ( ) for excluded endpoints.'});
const text=(key,label,value,accepted=[])=>({key,label,type:'text',value,accepted});
const points=value=>({key:'points',label:'Intersection points',type:'points',value,hint:'Enter points such as (0, 3); (3, 0). Order does not matter.'});
const names=['Functions and Continuity','Linearity and Symmetry','Extrema and End Behavior','Sketching Graphs of Functions','Graphing Special Functions','Transformations of Functions','Solving Equations by Graphing'];
export const chapter2=[];
function add(lesson,difficulty,prompt,choices,correct,fields,work,explanation,depth){
 const id=`2-${lesson}-q${difficulty}`;chapter2.push({questionId:id,courseId:'chapter-2',courseName:'Chapter 2: Relations and Functions',lessonId:`2-${lesson}`,lessonName:names[lesson-1],difficulty,difficultyLabel:['Standard','Hard','Hard–Challenge','Challenge','Hardest'][difficulty-1],prompt,choices:choices?.map((text,i)=>({letter:'ABCD'[i],text}))??[],correctChoice:correct,isGraph:choices===null,supportedMethods:choices===null?['mc']:['mc','written'],fields:fields??[],work,reasoning:explanation,explanation:`**Correct Answer:** ${correct}\n\n#### Work\n\n${work}\n\n#### Explanation\n\n${explanation}`,depth,contentVersion:3,active:true});
}
add(1,1,R`For \(f(x)=3x-2\), find \(f(-4)\).`,[R`\(-14\)`,R`\(-10\)`,R`\(10\)`,R`\(14\)`],'A',[number('value','f(-4)',-14)],R`Substitute the input before simplifying:
\[
f(-4)=3(-4)-2=-12-2=-14.
\]`,`The negative input is multiplied by 3; the final subtraction is still minus 2.`);
add(1,2,R`A function has domain \(\{-2,0,3\}\) and codomain \(\{1,4,7\}\), with
\[
f(-2)=1,\qquad f(0)=a+6,\qquad f(3)=7.
\]
Find \(a\) so that the function is both one-to-one and onto its stated codomain.`,[R`\(2\)`,R`\(-2\)`,R`\(4\)`,R`\(-4\)`],'B',[number('value','a',-2)],R`For the function to be onto, every member of the codomain must occur. Outputs 1 and 7 are already used. The remaining input must produce 4:
\[
a+6=4\quad\Rightarrow\quad a=-2.
\]
The three outputs are then 1, 4, and 7, with no repetition, so the function is also one-to-one.`,`One-to-one prevents repeated outputs; onto requires every stated codomain value to be reached. Both conditions hold for this value.`);
add(1,3,R`Find \(k\) so that this function is continuous at \(x=2\):
\[
f(x)=\begin{cases}3x-1,&x<2,\\kx+3,&x\ge2.\end{cases}
\]`,[R`\(k=-1\)`,R`\(k=4\)`,R`\(k=1\)`,R`\(k=5\)`],'C',[number('k','k',1)],R`The left-hand branch approaches \(3(2)-1=5\). The value and the approach from the right equal \(2k+3\). Match them:
\[
2k+3=5\quad\Rightarrow\quad k=1.
\]`,`Both branches are lines, so matching their values at the join removes the only possible break.`);
add(1,4,R`Define
\[
f(x)=\begin{cases}\dfrac{x^2-9}{x-3},&x\ne3,\\c,&x=3.\end{cases}
\]
Find the value of \(c\) that makes \(f\) continuous for every real \(x\).`,[R`\(c=0\)`,R`\(c=3\)`,R`\(c=9\)`,R`\(c=6\)`],'D',[number('c','c',6)],R`For \(x\ne3\), factor and cancel:
\[
\frac{(x-3)(x+3)}{x-3}=x+3.
\]
The surrounding values approach \(3+3=6\). Set \(f(3)=c=6\).`,`Cancellation describes the graph away from the missing input. A separate value of 6 fills the hole; substituting 3 into the original quotient would divide by zero.`);
add(1,5,R`Find the unique pair \((a,b)\) that makes this function continuous on all real numbers:
\[
f(x)=\begin{cases}ax+b,&x<0,\\x^2+1,&0\le x\le2,\\bx+a,&x>2.\end{cases}
\]`,[R`\((a,b)=(3,1)\)`,R`\((a,b)=(1,3)\)`,R`\((a,b)=(5,1)\)`,R`\((a,b)=(1,1)\)`],'A',[number('a','a',3),number('b','b',1)],R`Continuity must hold at both joins. At \(x=0\), the left branch approaches \(b\), while the middle value is 1. Thus \(b=1\).

At \(x=2\), the middle value is 5 and the right branch approaches \(2b+a\). Therefore
\[
2b+a=5,\qquad 2(1)+a=5,\qquad a=3.
\]
All three formulas are continuous within their own pieces, so both join conditions are sufficient.`,`Checking only one join leaves a free parameter. The same parameters appear in different roles at the two joins, and both conditions must be satisfied.`,`Coupled continuity conditions at two endpoints; necessity and sufficiency.`);
add(2,1,R`Classify \(f(x)=x^3-4x\) as even, odd, or neither.`,['Even','Odd','Neither','Both even and odd'],'B',[text('symmetry','Even, odd, or neither?','Odd',['odd function'])],R`Replace \(x\) by \(-x\):
\[
f(-x)=-x^3+4x=-(x^3-4x)=-f(x).
\]`,`The function is odd and has origin symmetry. It is not the zero function, so it is not also even.`);
add(2,2,R`The points in this table lie on one line. Find \(a\).

| \(x\) | -2 | 1 | 5 |
|---|---:|---:|---:|
| \(y\) | 7 | 1 | \(a\) |`,[R`\(a=-5\)`,R`\(a=9\)`,R`\(a=-7\)`,R`\(a=-3\)`],'C',[number('a','a',-7)],R`The first interval has slope
\[
\frac{1-7}{1-(-2)}=-2.
\]
The next input change is 4, so its output change is \(-8\). Thus \(a=1-8=-7\).`,`Equal slopes are required even though the input intervals have different lengths.`);
add(2,3,R`Which graph represents an **even function** that is continuous for all real \(x\), with \(f(0)=-2\) and \(f(2)=2\)?`,null,'D',[],R`An even function must mirror across the y-axis. The curve \(y=x^2-2\) has that symmetry and satisfies
\[
f(0)=-2,\qquad f(2)=4-2=2.
\]`,`Graph D is symmetric about the y-axis and passes through both required points. The other panels either shift the axis, reflect the curve downward, or use a different vertical intercept.`);
add(2,4,R`Find \(a\) and \(b\) so that
\[
f(x)=(a-2)x^4+(b+3)x^2-5x+(a+b+1)
\]
is an odd function.`,[R`\((a,b)=(2,-3)\)`,R`\((a,b)=(-2,3)\)`,R`\((a,b)=(2,3)\)`,R`\((a,b)=(0,-1)\)`],'A',[number('a','a',2),number('b','b',-3)],R`In an odd polynomial, every even-power coefficient, including the constant term, is zero. Hence
\[
a-2=0,\qquad b+3=0,\qquad a+b+1=0.
\]
The first two give \(a=2,b=-3\); these also satisfy the third. The resulting function is \(-5x\).`,`All conditions must hold for every input. Checking just the constant term would not eliminate the even powers.`);
add(2,5,R`A quadratic \(f(x)=ax^2+bx+c\), with \(a\ne0\), satisfies
\[
f(2+t)=f(2-t)\quad\text{for every real }t.
\]
Also \(f(0)=3\) and \(f(1)=0\). Find \((a,b,c)\).`,[R`\((1,4,3)\)`,R`\((1,-4,3)\)`,R`\((3,-4,1)\)`,R`\((-1,4,3)\)`],'B',[number('a','a',1),number('b','b',-4),number('c','c',3)],R`The identity describes symmetry about \(x=2\). Subtract the two expressions:
\[
f(2+t)-f(2-t)=(8a+2b)t.
\]
This vanishes for every \(t\) only if \(b=-4a\). Next \(f(0)=c=3\), and
\[
f(1)=a+b+c=a-4a+3=0.
\]
Thus \(a=1,b=-4,c=3\). Check: \(f(2+t)=t^2-1=f(2-t)\).`,`The symmetry is about x = 2 rather than the y-axis. Translating the identity into a coefficient constraint is essential.`,`Translate a universal symmetry identity into parameter constraints and verify the result.`);
add(3,1,R`Find the minimum value of \(f(x)=(x-3)^2-4\) and the input where it occurs.`,[R`Minimum \(3\) at \(x=-4\)`,R`Minimum \(4\) at \(x=3\)`,R`Minimum \(-4\) at \(x=3\)`,R`Minimum \(-4\) at \(x=-3\)`],'C',[number('value','Minimum value',-4),number('x','Input x',3)],R`A square is nonnegative and equals zero when \(x-3=0\). Therefore
\[
f(x)\ge-4,\qquad f(3)=-4.
\]`,`The vertex is (3, −4); distinguish the input coordinate from the minimum output.`);
add(3,2,R`Describe both ends of the graph of
\[
f(x)=-2x^5+3x^2-1.
\]
Give the behavior as \(x\to-\infty\) and as \(x\to+\infty\), in that order.`,['Down; down','Down; up','Up; up','Up; down'],'D',[text('left','Left end: up or down?','Up',['positive infinity','+infinity','+∞','infinity']),text('right','Right end: up or down?','Down',['negative infinity','-infinity','-∞'])],R`The highest-degree term is \(-2x^5\). Its odd degree gives opposite end directions, and its negative coefficient reverses the usual rising cubic pattern:
\[
x\to-\infty:\ f(x)\to+\infty;
\qquad x\to+\infty:\ f(x)\to-\infty.
\]`,`Lower-degree terms cannot change the eventual end behavior.`);
add(3,3,R`Which graph has a local maximum at \((-1,1)\), a local minimum at \((1,-1)\), and rises without bound to the right?`,null,'A',[],R`The required curve rises to \((-1,1)\), decreases to \((1,-1)\), then rises again. Graph A has this pattern; its curve is
\[
y=\tfrac12x^3-\tfrac32x.
\]
It passes through both turning points and has a positive leading coefficient.`,`B reverses the extrema and the ends, C shifts the turning values upward, and D is increasing throughout and has no turning points.`);
add(3,4,R`For \(f(x)=(x+1)^2-4\) restricted to \(-3\le x\le2\), find both the absolute minimum and the absolute maximum, including the input where each occurs.`,[R`Minimum \(-4\) at \(-1\); maximum \(0\) at \(-3\)`,R`Minimum \(-4\) at \(-1\); maximum \(5\) at \(2\)`,R`Minimum \(0\) at \(-3\); maximum \(5\) at \(2\)`,R`Minimum \(-4\) at \(1\); no maximum`],'B',[number('min','Minimum value',-4),number('minX','Input for minimum',-1),number('max','Maximum value',5),number('maxX','Input for maximum',2)],R`The vertex input \(-1\) belongs to the interval and gives \(f(-1)=-4\). Check both endpoints:
\[
f(-3)=0,\qquad f(2)=5.
\]
Distance from the vertex controls the square, so the right endpoint gives the largest value.`,`A restricted domain can create an absolute maximum even though the unrestricted parabola has none. Both endpoints must be considered.`);
add(3,5,R`Let \(g_a(x)=(x-a)^2-4\) have domain \([-1,3]\). Find **all real values of \(a\)** for which its range is exactly \([-4,12]\).`,[R`\(a=1\)`,R`\(a=-3\text{ or }5\)`,R`\(a=-1\text{ or }3\)`,R`\(-1\le a\le3\)`],'C',[{key:'values',label:'All values of a',type:'numberSet',value:'-1,3',hint:'Separate values with commas; order does not matter.'}],R`To attain the minimum \(-4\), the square must vanish somewhere in the domain. Thus \(a\in[-1,3]\).

The farthest endpoint from \(a\) determines the maximum. Requiring that maximum to be 12 gives
\[
\max\{(a+1)^2,(3-a)^2\}=16.
\]
For \(a\in[-1,3]\), both distances lie in \([0,4]\). A distance equals 4 only when \(a=3\) or \(a=-1\). At either value the continuous function takes every output from −4 to 12.`,`A vertex inside the domain is necessary but not enough. Combining the minimum and maximum conditions leaves exactly the two endpoint positions.`,`Simultaneous range constraints, parameter-dependent vertex location and endpoint analysis.`);
add(4,1,R`Which graph represents \(y=|x|-2\)?`,null,'D',[],R`Begin with \(y=|x|\) and shift down 2. The vertex becomes \((0,-2)\), the graph opens upward, and the x-intercepts are \((-2,0)\) and \((2,0)\).`,`D has the required vertex, direction, and unit slopes. The other graphs change a shift, reflection, or scale.`);
add(4,2,R`Which graph represents this continuous piecewise function?
\[
f(x)=\begin{cases}x+2,&x<0,\\-2x+2,&x\ge0.\end{cases}
\]`,null,'A',[],R`Both pieces meet at \((0,2)\). The left branch has slope 1 and the right branch has slope −2. The intercepts are \((-2,0)\) and \((1,0)\).`,`A joins the correct pieces without a gap. The other choices change a branch slope or the common height.`);
add(4,3,R`Choose the graph of an odd, continuous function whose only zeros are \(-2,0,2\), which is positive on \((-2,0)\), negative on \((0,2)\), and rises without bound as \(x\to+\infty\).`,null,'B',[],R`The sign changes and three zeros fit
\[
f(x)=\tfrac14x(x-2)(x+2).
\]
This function is odd. Its factors give positive values between −2 and 0, negative values between 0 and 2, and positive values for large positive x.`,`B meets every stated feature. A reverses the signs and end behavior; C puts the nonzero roots at ±3; D is even and has only two zeros.`);
add(4,4,R`A continuous function has domain \([-4,4]\). It is linear between consecutive points in this list:
\[
(-4,-2),\quad(-2,2),\quad(1,-1),\quad(4,2).
\]
Which graph shows the function, including the correct endpoints?`,null,'C',[],R`Join the points in their listed order. The three segment slopes are
\[
\frac{4}{2}=2,\qquad\frac{-3}{3}=-1,\qquad\frac{3}{3}=1.
\]
Both domain endpoints are included, so both endpoint markers must be filled.`,`C has the required turning points, segment slopes and closed endpoints. A reverses the vertical values, B changes a turning point, and D incorrectly excludes both endpoints.`);
add(4,5,R`A continuous **odd** function satisfies \(f(1)=3\) and \(f(3)=1\). It is linear on \([0,1]\) and on \([1,3]\). For \(x\ge3\), it is linear with slope 2. Which graph can represent the function on all real numbers?`,null,'D',[],R`Oddness gives \(f(0)=0\). The positive side runs through \((0,0),(1,3),(3,1)\), then follows the ray of slope 2. For every positive input, reflect its point through the origin:
\[
f(-1)=-3,\qquad f(-3)=-1.
\]
The negative outer ray must also have slope 2, not −2.`,`D obeys the interval rules and origin symmetry simultaneously. A uses y-axis symmetry on the left; B changes the inner turning height; C uses the wrong outer slopes.`,`Reconstruct an entire function from partial data, odd symmetry, continuity and outer-ray constraints.`);
add(5,1,R`The notation \(\lfloor x\rfloor\) means the greatest integer less than or equal to \(x\). Find \(\lfloor-1.2\rfloor\).`,[R`\(-2\)`,R`\(-1\)`,R`\(1\)`,R`\(2\)`],'A',[number('value','Greatest integer value',-2)],R`The integers immediately around −1.2 are −2 and −1. Only −2 is less than or equal to −1.2, so \(\lfloor-1.2\rfloor=-2\).`,`The greatest-integer operation rounds down along the number line, not toward zero.`);
add(5,2,R`Which graph represents \(f(x)=\lfloor x\rfloor+1\)? Each step includes its left endpoint and excludes its right endpoint.`,null,'B',[],R`For any integer \(n\),
\[
n\le x<n+1\quad\Rightarrow\quad f(x)=n+1.
\]
In particular the step on \([0,1)\) has height 1.`,`B has the correct heights and filled-left/open-right markers. A reverses the endpoint convention, C shifts the graph down, and D reverses the step direction.`);
add(5,3,R`A shipping service charges
\[
C(w)=4+2\left\lceil\frac{w}{3}\right\rceil
\]
dollars for any real package weight \(w>0\). Here \(\lceil u\rceil\) is the least integer greater than or equal to \(u\). Find the complete interval of weights that cost **at most $12**.`,[R`\((0,9]\)`,R`\([0,12]\)`,R`\((0,12]\)`,R`\((0,12)\)`],'C',[interval('(0,12]')],R`The budget condition is
\[
4+2\lceil w/3\rceil\le12\quad\Rightarrow\quad\lceil w/3\rceil\le4.
\]
Since 4 is an integer, this is equivalent to \(w/3\le4\), so \(w\le12\). Combine this with the domain \(w>0\).`,`A weight of exactly 12 costs $12 and is included. A weight of zero is excluded by the stated domain; any weight above 12 starts the fifth charged unit.`);
add(5,4,R`Which graph represents \(f(x)=-|x-1|+3\), including the vertex and both x-intercepts?`,null,'D',[],R`The negative sign opens the graph downward. The vertex is \((1,3)\). For the intercepts,
\[
|x-1|=3\quad\Rightarrow\quad x=-2\text{ or }4.
\]`,`D has the correct maximum and intercepts. The other choices alter the horizontal shift, reflection, or vertical scale.`);
add(5,5,R`Find every real \(x\) satisfying
\[
\lfloor x\rfloor+\lfloor2x\rfloor=4.
\]
Give the answer as one interval.`,[R`\([3/2,2)\)`,R`\([1,3/2)\)`,R`\([4/3,5/3)\)`,R`\([2,5/2)\)`],'A',[interval('[3/2,2)')],R`Write \(x=n+r\), where \(n\) is an integer and \(0\le r<1\). Then
\[
\lfloor x\rfloor+\lfloor2x\rfloor=3n+\lfloor2r\rfloor.
\]
The final term is either 0 or 1. To obtain 4, necessarily \(n=1\) and \(\lfloor2r\rfloor=1\). Thus \(1/2\le r<1\), giving \(3/2\le x<2\).`,`The two greatest-integer terms cannot be replaced by 3x. The integer/fractional-part argument proves that no other interval works.`,`Separate integer and fractional parts to solve a discontinuous equation completely.`);
add(6,1,R`You know that \(f(3)=-2\). If \(g(x)=f(x-4)+5\), find \(g(7)\).`,[R`\(-7\)`,R`\(3\)`,R`\(7\)`,R`\(-3\)`],'B',[number('value','g(7)',3)],R`The transformed input is \(7-4=3\). Therefore
\[
g(7)=f(3)+5=-2+5=3.
\]`,`Use the transformed input before adding the outside vertical shift.`);
add(6,2,R`Which graph represents
\[
g(x)=-\tfrac12(x+2)^2+3?
\]`,null,'C',[],R`Relative to \(y=x^2\), shift left 2, multiply the outputs by −1/2, and shift up 3. The vertex is \((-2,3)\), the graph opens downward, and \(g(0)=1\).`,`C has the correct location and width. A shifts right, B opens upward, and D uses a vertical stretch instead of a compression.`);
add(6,3,R`The point \((6,5)\) lies on \(y=f(x)\). Find the corresponding point on
\[
y=3f(2x-4)-1.
\]`,[R`\((8,14)\)`,R`\((1,14)\)`,R`\((5,4)\)`,R`\((5,14)\)`],'D',[number('x','New x-coordinate',5),number('y','New y-coordinate',14)],R`To use the known input 6, solve \(2x-4=6\), obtaining \(x=5\). Transform the output separately:
\[
y=3(5)-1=14.
\]`,`Horizontal changes act through the inside input equation; they do not use the same rule as the vertical changes.`);
add(6,4,R`Which graph represents \(g(x)=|2x-4|-3\)?`,null,'A',[],R`Rewrite the function as
\[
g(x)=2|x-2|-3.
\]
Its vertex is \((2,-3)\), its slopes are −2 and 2, and its x-intercepts are \(1/2\) and \(7/2\).`,`A shows the correct horizontal shift and steepness. The other panels shift the vertex left, compress the slopes, or reflect the graph downward.`);
add(6,5,R`Let \(f(x)=|x|\) and \(g(x)=a f(bx-6)+c\), where \(a>0\) and \(b>0\). The minimum point of \(g\) is \((3,-4)\), and \(g(5)=8\). Find \((a,b,c)\).`,[R`\((6,2,-4)\)`,R`\((3,2,-4)\)`,R`\((2,3,-4)\)`,R`\((3,2,4)\)`],'B',[number('a','a',3),number('b','b',2),number('c','c',-4)],R`Because \(a>0\), the minimum occurs when \(bx-6=0\). At \(x=3\), this gives \(3b=6\), hence \(b=2\). The minimum output is \(c=-4\).

Use the other point:
\[
8=a|2(5)-6|-4=4a-4\quad\Rightarrow\quad a=3.
\]
Check: \(g(x)=3|2x-6|-4=6|x-3|-4\).`,`The visible branch slope is ab = 6, not a alone. The vertex location is needed to distinguish the inner scale from the outer scale.`,`Recover three transformation parameters from geometric constraints while separating inner and outer scale.`);
add(7,1,R`Which graph correctly shows the intersections used to solve \(x^2=4\), by plotting \(y=x^2\) and \(y=4\)?`,null,'C',[],R`The horizontal line has height 4. On the parabola, \(x^2=4\) at \(x=-2\) and \(x=2\), so the intersections are \((-2,4)\) and \((2,4)\).`,`C has both required curves. The other panels use the wrong horizontal level, open the parabola downward, or shift its vertex.`);
add(7,2,R`Find all intersection points of \(y=|x-1|\) and \(y=x+1\).`,[R`\((1,2)\)`,R`\((0,1);\ (2,3)\)`,'No intersection',R`\((0,1)\)`],'D',[points('(0,1)')],R`For \(x\ge1\), equality would require \(x-1=x+1\), which is impossible.

For \(x<1\), solve \(1-x=x+1\), giving \(x=0\), which belongs to that branch. Then \(y=1\).`,`There is only one intersection. A branch equation can yield no intersection even though both full graphs are unbounded.`);
add(7,3,R`Which graph correctly shows both \(y=|x|\) and \(y=\tfrac12x+1\), whose intersections solve \(|x|=\tfrac12x+1\)?`,null,'A',[],R`The line has slope 1/2 and intercept 1. On the right, \(x=x/2+1\) gives \(x=2\). On the left, \(-x=x/2+1\) gives \(x=-2/3\).
\[
\text{Intersections: }(-2/3,2/3)\text{ and }(2,2).
\]`,`A shows the correct upward V and line. B changes the line's slope, C changes its intercept, and D changes the V's vertex.`);
add(7,4,R`Find all intersection points of
\[
y=x^2-4x+3\qquad\text{and}\qquad y=-x+3.
\]
Use the common y-values to check each point.`,[R`\((0,0);\ (3,3)\)`,R`\((0,3);\ (3,0)\)`,R`\((1,2);\ (3,0)\)`,R`\((0,3);\ (4,-1)\)`],'B',[points('(0,3);(3,0)')],R`At an intersection, the outputs agree:
\[
x^2-4x+3=-x+3\quad\Rightarrow\quad x(x-3)=0.
\]
Thus \(x=0\) or \(x=3\). Substitution into either formula gives \(y=3\) and \(y=0\), respectively.`,`The equation gives x-coordinates only. Both full ordered pairs must be reported and must satisfy both graphs.`);
add(7,5,R`For which real values of \(k\) do the graphs
\[
y=|x-2|\qquad\text{and}\qquad y=kx+1
\]
have **exactly two distinct intersection points**? Give the complete interval of \(k\).`,[R`\([-1/2,1)\)`,R`\((-1,1)\)`,R`\((-1/2,1)\)`,R`\((-\infty,-1)\cup(-1/2,1)\)`],'C',[interval('(-1/2,1)')],R`Two distinct intersections require one strictly on each side of the vertex \(x=2\).

On the right, \(x-2=kx+1\), so \(x=3/(1-k)\). The condition \(x>2\) holds exactly when
\[
-\tfrac12<k<1.
\]
For these values, the left-branch equation \(2-x=kx+1\) gives \(x=1/(k+1)<2\), so the second intersection really lies on the left.

At \(k=-1/2\), both expressions give the same vertex, so there is only one distinct intersection. At \(k=1\), the right branch is parallel to the line and never meets it. Outside the stated interval the right branch has no valid intersection strictly beyond the vertex.`,`Solving two algebraic equations is not sufficient: each solution must belong to its branch, and a shared vertex must not be counted twice.`,`Parameter-dependent intersection count with branch inequalities and endpoint exclusions.`);
