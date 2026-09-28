// Required difficulty refinement: preserve the supplied inequality's solution
// set and A–D graph choices while making Q5 depend on parameter reasoning.
export function reviseForDepth(question){
 if(question.questionId!=='1-5-q5')return question;
 return {...question,depthRefinement:'Universal parameter; same solution set and correct graph as the supplied source',
  prompt:String.raw`Consider the inequality

\[
\frac32(x+t)-\frac54(y+t)\ge6.
\]

Which graph represents all starting points \((x,y)\) for which this inequality holds for **every real number \(t\ge0\)**?`,
  explanation:String.raw`**Correct answer: B**

The phrase **every \(t\ge0\)** includes \(t=0\). Any allowed starting point must therefore satisfy

\[
\frac32x-\frac54y\ge6.
\]

To check whether that condition is also sufficient, expand the parameter terms:

\[
\frac32(x+t)-\frac54(y+t)
=\frac32x-\frac54y+\frac14t.
\]

Since \(t\ge0\), the extra term \(\frac14t\) can only increase the left-hand side. Thus a point that works at \(t=0\) works for every allowed \(t\). A point that fails at \(t=0\) cannot be included, even if it works for a larger value of \(t\).

The complete solution set is therefore exactly

\[
6x-5y\ge24.
\]

Dividing by \(-5\) reverses the inequality:

\[
y\le\frac65x-\frac{24}{5}.
\]

The boundary is solid, and the region lies below it. This is graph **B**.`};
}
