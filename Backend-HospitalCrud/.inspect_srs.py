from docx import Document
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from docx.table import Table
f=Document('Smart_Hospital_Management_System_SRS.docx')
pg=1
print('SECTIONS',len(f.sections),'TABLES',len(f.tables))
for el in f.element.body.iterchildren():
 if el.tag==qn('w:p'):
  p=Paragraph(el,f)
  if p.text.strip(): print(f'{pg:02d} P [{p.style.name}] {p.text[:125]}')
  if el.xpath('.//w:br[@w:type="page"]'): pg+=1
 elif el.tag==qn('w:tbl'):
  t=Table(el,f); print(f'{pg:02d} TABLE {len(t.rows)}x{len(t.columns)} {t.cell(0,0).text[:45]} | {t.cell(0,min(1,len(t.columns)-1)).text[:55]}')
