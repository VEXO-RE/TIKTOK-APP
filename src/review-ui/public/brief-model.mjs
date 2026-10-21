const fields = ['name','quantity','color','style','sourceRef','observedAt','confirmed'];
function text(value,max,required=false){
 if(typeof value!=='string'||value.length>max||/[\u0000-\u001f]/.test(value)||(required&&!value.trim()))throw Error('Revisa los campos y sus límites.');
 return value.trim();
}
export function createCreativeBrief(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!fields.includes(k)))throw Error('Campos no admitidos.');
 if(input.confirmed!==true)throw Error('Confirma los datos y su fuente.');
 const name=text(input.name,100,true),color=text(input.color??'',40),style=text(input.style??'',40);
 const sourceRef=text(input.sourceRef,500,true),observedAt=text(input.observedAt,10,true),quantity=input.quantity;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(observedAt)||new Date(observedAt+'T00:00:00Z').toISOString().slice(0,10)!==observedAt)throw Error('Fecha inválida.');
 if(!Number.isInteger(quantity)||quantity<1||quantity>100)throw Error('Cantidad entre 1 y 100.');
 const factsUsed=[{field:'name',value:name},{field:'quantity',value:quantity},...(color?[{field:'color',value:color}]:[]),...(style?[{field:'style',value:style}]:[])].map(f=>({...f,sourceRef,observedAt}));
 const identity=quantity+' × '+name,details=[color&&'Color: '+color,style&&'Estilo: '+style].filter(Boolean);
 const cta='Consulta precio, medidas y disponibilidad antes de comprar.';
 const shots=[
 {start:0,end:4,text:identity,visual:'Mostrar el producto real completo y la cantidad indicada.'},
 {start:4,end:9,text:details.join(' · ')||name,visual:'Acercamiento al producto real; no añadir características sin documentar.'},
 {start:9,end:15,text:'Consulta los detalles',visual:'Vista final del producto real. Mantener texto legible.'}];
 return {schemaVersion:'1.0.0',generator:'local-template-v1',state:'needs_human_review',title:identity,
 proposedCopy:[identity,...details,cta].join('\n'),narration:[identity+'.',...details.map(s=>s+'.'),cta].join(' '),
 shots,factsUsed,citations:[{sourceRef,observedAt}],
 uncertainties:['Fuente declarada por el operador, sin verificación remota.','Precio, stock, medidas, materiales, entrega y derechos de medios no comprobados.'],
 qcFindings:['Revisar cada dato contra la fuente antes de aprobar.','Tomas propuestas de 15 segundos: ajustar a los medios reales.'],
 editorOverlays:shots.map(s=>s.start+' | '+s.end+' | '+s.text.replaceAll('|','／')).join('\n')};
}
export function briefText(b){return ['BORRADOR · REQUIERE REVISIÓN HUMANA',b.title,'\nDESCRIPCIÓN',b.proposedCopy,'\nNARRACIÓN',b.narration,'\nTEXTOS PARA EL EDITOR',b.editorOverlays,'\nTOMAS',...b.shots.map(s=>s.start+'–'+s.end+'s: '+s.visual),'\nFUENTE',...b.citations.map(c=>c.sourceRef+' · consultada '+c.observedAt),'\nPENDIENTES',...b.uncertainties].join('\n');}
