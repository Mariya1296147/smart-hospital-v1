from docx import Document
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
import zipfile, re
f='Smart_Hospital_Management_System_SRS.docx'; d=Document(f)
head=[]; count=0
for e in d.element.body.iterchildren():
 if e.tag==qn('w:p'):
  p=Paragraph(e,d)
  if e.xpath('.//w:br[@w:type="page"]'): count+=1
  if p.style.name=='Heading 1' and p.text.strip(): head.append(p.text.strip())
with zipfile.ZipFile(f) as z: bad=z.testzip()
print('Manual breaks:',count,'DOCX integrity:',bad or 'OK')
print('Numbered top headings:',[re.match(r'^(\d+)\.',x).group(1) for x in head if re.match(r'^\d+\.',x)])
print('Headings:',head)
print('TOC section pages:',[(r.cells[0].text,r.cells[1].text) for r in d.tables[1].rows[1:17]])
