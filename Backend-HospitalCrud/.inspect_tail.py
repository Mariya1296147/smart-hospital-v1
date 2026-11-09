from docx import Document
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from docx.table import Table
p='Smart_Hospital_Management_System_SRS.docx'
d=Document(p); n=1
for e in d.element.body.iterchildren():
 if e.tag==qn('w:p'):
  x=Paragraph(e,d)
  if x.text.strip() and n>=11: print(f'{n:02} P [{x.style.name}] {x.text[:150]}')
  if e.xpath('.//w:br[@w:type="page"]'): n+=1
 elif e.tag==qn('w:tbl') and n>=11:
  t=Table(e,d); print(f'{n:02} TABLE {len(t.rows)}x{len(t.columns)} {t.cell(0,0).text[:55]} | {t.cell(0,min(1,len(t.columns)-1)).text[:60]}')
