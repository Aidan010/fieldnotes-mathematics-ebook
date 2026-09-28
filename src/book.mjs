import {courseUnits,reviewPages,midChapterPages} from './course.mjs';
import {lessons} from '../practice/content/lessons.mjs';
import {extensions} from '../practice/content/extensions.mjs';
export const sections = [
  [1,'Get ready for the chapter','Chapter preparation'],
  [2,'Solving Linear Equations','Lesson 1'],
  [10,'Solving Linear Inequalities','Lesson 2'],
  [17,'Interval and Set-Builder Notation','Algebra lab'],
  [18,'Rate of Change and Slope','Lesson 3'],
  [25,'Writing Linear Equations','Lesson 4'],
  [32,'Graphing Linear Inequalities','Lesson 5'],
  [39,'Solving Systems of Equations','Lesson 6'],
  [49,'Systems of Inequalities','Lesson 7'],
  [57,'Optimization with Linear Programming','Lesson 8'],
  [64,'Systems in Three Variables','Lesson 9'],
  [71,'Study Guide and Review','Chapter review'],
  [76,'Practice Test','Check your understanding'],
  [77,'Preparing for Assessment','Assessment practice']
];
export const chapters = courseUnits;
export const chapter2Sections = [[1,'Relations and Functions','Chapter introduction'],[3,'Get ready for the chapter','Chapter preparation'],[4,'Functions and Continuity','Lesson 1'],[12,'Linearity and Symmetry','Lesson 2'],[20,'Extrema and End Behavior','Lesson 3'],[28,'Sketching Graphs of Functions','Lesson 4'],[34,'Mid-Chapter Quiz','Chapter checkpoint'],[35,'Graphing Special Functions','Lesson 5'],[42,'Transformations of Functions','Lesson 6'],[50,'Solving Equations by Graphing','Lesson 7'],[55,'Study Guide and Review','Chapter review'],[60,'Practice Test','Check your understanding'],[61,'Preparing for Assessment','Assessment practice']];
export const sectionsFor = chapter => {
 const ch=chapters.find(c=>c.id===chapter);if(!ch)return [];
 const base=chapter===1?[...sections]:chapter===2?[...chapter2Sections]:[[1,ch.title,'Chapter introduction'],[3,'Get ready for the chapter','Chapter preparation'],...lessons.filter(l=>l.chapter===chapter).map(l=>[l.ebookPage,l.name,'Lesson '+l.id.split('-')[1]]),...reviewPages[chapter].map((p,i)=>[p,['Study Guide and Review','Practice Test','Preparing for Assessment'][i],['Chapter review','Check your understanding','Assessment practice'][i]]),[midChapterPages[chapter],'Mid-Chapter Quiz','Chapter checkpoint']];
 for(const e of extensions.filter(e=>Number(e.lessonId.split('-')[0])===chapter))if(!base.some(s=>s[0]===e.ebookPage))base.push([e.ebookPage,e.title,'Lesson lab']);
 return base.sort((a,b)=>a[0]-b[0]);
};
export const totalPages = () => chapters.reduce((sum,c)=>sum+c.pages,0);
export const urlFor = (chapter,page) => `/ebook/chapter${chapter}/p${page}`;
export function getPage(chapter,page){
 const ch=chapters.find(c=>c.id===chapter);
 if(!ch||!Number.isInteger(page)||page<1||page>ch.pages) return null;
 const section=[...sectionsFor(chapter)].reverse().find(s=>s[0]<=page);
 return {chapter,page,title:section[1],label:section[2],printed:ch.firstPrinted+page-1,asset:`/scans/chapter${chapter}-spread${Math.ceil(page/2)}.webp`,side:page%2===1?'left':'right',position:chapters.filter(c=>c.id<chapter).reduce((sum,c)=>sum+c.pages,0)+page};
}
