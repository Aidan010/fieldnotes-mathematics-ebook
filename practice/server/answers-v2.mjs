const number=(key,label,value)=>({key,label,type:'number',value:String(value),hint:'Numbers, fractions, and equivalent arithmetic expressions are accepted.'});
const text=(key,label,value,accepted)=>({key,label,type:'text',value,accepted});
const relation=value=>({key:'inequality',label:'Solution inequality',type:'inequality',value,hint:'Enter the complete inequality. Use <, >, <=, or >=.'});
const line=value=>({key:'equation',label:'Equation of the line',type:'line',value,hint:'Equivalent linear equations are accepted, including standard and slope-intercept form.'});
const pair=(x,y)=>[number('x','x',x),number('y','y',y)];
const triple=(x,y,z)=>[...pair(x,y),number('z','z',z)];
const optimum=(x,y,value,label)=>[...pair(x,y),number('value',label,value)];
export const answersV2={
 '1-1-q1':[number('x','x',7)],'1-1-q2':[number('x','x',5)],'1-1-q3':[number('x','x',16)],'1-1-q4':[number('x','x',10)],
 '1-1-q5':[text('solution','Solution type','No solution',['none','no solutions','no solution','empty set','there is no solution','there are no solutions','the equation has no solution','no real solution'])],
 '1-2-q1':[relation('x>5')],'1-2-q2':[relation('x>=-4')],'1-2-q3':[relation('x<12/13')],'1-2-q4':[relation('x>=35')],
 '1-2-q5':[{key:'interval',label:'Solution in interval notation',type:'interval',value:'(-11/3,19/3]',hint:'Use brackets for included endpoints and parentheses for excluded endpoints.'}],
 '1-3-q1':[number('m','Slope',2)],'1-3-q2':[number('m','Slope',-2)],'1-3-q3':[number('m','Rate of change',-2)],
 '1-3-q4':[number('rate','Rate of change (liters per minute)',-30),text('interpretation','Does the amount of water increase or decrease?','Decreases',['decreases','decrease','decreasing','the amount of water decreases','the amount of water decreases over time'])],
 '1-3-q5':[number('a','a','15/7')],
 '1-4-q1':[line('y=4x-7')],'1-4-q2':[line('y=-3x+11')],'1-4-q3':[line('y=-2x+2')],'1-4-q4':[line('y=-2x+7')],'1-4-q5':[line('14x+21y=83')],
 '1-6-q1':pair(6,3),'1-6-q2':pair('55/17','37/17'),
 '1-6-q3':[text('solution','Solution type','Infinitely many solutions',['infinitely many solutions','infinitely many','infinite solutions','infinite','there are infinitely many solutions','the system has infinitely many solutions'])],
 '1-6-q4':[number('k','k',2)],'1-6-q5':[number('thirty','Liters of 30% solution',18),number('sixtyFive','Liters of 65% solution',24)],
 '1-8-q2':optimum(4,4,36,'Maximum value of P'),'1-8-q3':optimum(3,2,26,'Minimum value of C'),
 '1-8-q4':[number('x','Units of A',4),number('y','Units of B',4),number('value','Maximum profit ($)',360)],'1-8-q5':optimum(4,5,73,'Maximum integer value of P'),
 '1-9-q1':triple(4,2,3),'1-9-q2':triple(1,2,3),'1-9-q3':triple(3,0,2),'1-9-q4':triple(2,1,3),'1-9-q5':[number('k','k giving no solution',-1)]
};
