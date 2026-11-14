const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const StyleSheet=require('react-native-web/dist/cjs/exports/StyleSheet');
const createDOMStyle=require('react-native-web/dist/cjs/exports/StyleSheet/compiler/createReactDOMStyle');
const root=path.join(__dirname,'..');
function theme(platform){const module={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/theme.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module,exports:module.exports,require:()=>({Platform:{OS:platform}})});return module.exports;}
test('Shared direction preserves LTR layout using the property supported on each platform',()=>{
 const web=theme('web').ltrLayout,native=theme('android').ltrLayout;
 assert.equal(web.writingDirection,'ltr');assert.equal('direction' in web,false);
 assert.equal(native.direction,'ltr');assert.equal('writingDirection' in native,false);
 assert.equal(createDOMStyle(web).direction,'ltr');
});
test('Every affected screen and shared component passes the installed web stylesheet validator',()=>{
 const errors=[],original=console.error;let count=0;
 console.error=(...args)=>errors.push(args.join(' '));
 try{
  for(const folder of ['screens','components'])for(const name of fs.readdirSync(path.join(root,'src',folder))){
   if(!/\.tsx?$/.test(name))continue;
   const file=path.join(root,'src',folder,name),source=fs.readFileSync(file,'utf8');if(!source.includes('...ltrLayout'))continue;
   const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,name.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
   function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(ast)==='StyleSheet.create'){
    const rowDeclaration=ast.statements.find(statement=>ts.isVariableStatement(statement)&&statement.declarationList.declarations.some(declaration=>declaration.name.getText(ast)==='row'));
    const code=ts.transpileModule(`${rowDeclaration?.getText(ast)||''}\nStyleSheet.create(${node.arguments[0].getText(ast)});`,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
    vm.runInNewContext(code,{StyleSheet,...theme('web')},{filename:file});count++;
   }ts.forEachChild(node,visit);}visit(ast);
  }
 }finally{console.error=original;}
 assert.ok(count>=12,`validated ${count} style definitions`);assert.deepEqual(errors,[]);
});
