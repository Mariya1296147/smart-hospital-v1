from copy import deepcopy
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, Mm, RGBColor
from docx.text.paragraph import Paragraph
from docx.table import Table

path='Smart_Hospital_Management_System_SRS.docx'
doc=Document(path)
body=doc.element.body
pages=[]; current=[]
for el in list(body.iterchildren()):
    if el.tag==qn('w:sectPr'): continue
    if el.tag==qn('w:p') and el.xpath('.//w:br[@w:type="page"]'):
        # Preserve any non-break content in the page-break paragraph if present.
        clone=deepcopy(el)
        for br in clone.xpath('.//w:br[@w:type="page"]'):
            br.getparent().remove(br)
        if ''.join(clone.itertext()).strip(): current.append(clone)
        pages.append(current); current=[]
    else: current.append(deepcopy(el))
if current: pages.append(current)
assert len(pages)==20, f'expected 20 source pages, got {len(pages)}'
# Split the misplaced page 19 into the section 12 block and section 15 block.
constraints=[]; testing=[]; target=pages[18]; in_testing=False
for el in target:
    if el.tag==qn('w:p'):
        p=Paragraph(el,doc)
        if p.text.strip().lower().startswith('testing and acceptance criteria'):
            in_testing=True
    (testing if in_testing else constraints).append(el)
assert constraints and testing
# Keep all original material while placing sections in numerical order.
ordered=[pages[0],pages[1],*pages[2:11],constraints,pages[11],pages[12]+testing,pages[13],pages[14],pages[15],pages[16],pages[17],pages[19]]
assert len(ordered)==20
# Correct headings and the static contents page.
for pg in ordered:
    for el in pg:
        if el.tag==qn('w:p'):
            p=Paragraph(el,doc)
            if p.text.strip()=='12. Constraints, assumptions and 15. testing':
                p.text='12. Constraints and assumptions'
            elif p.text.strip()=='Testing and acceptance criteria':
                p.text='15. Testing and acceptance criteria'
# Update TOC rows to the new actual page locations.
toc=doc.tables[1]
rows=[
('SECTION','PAGE'),('1 Overview and introduction','3'),('2 Scope','3'),('3 Target users and roles','4'),('4 Functional requirements','5–7'),('5 Business rules','8'),('6 Non-functional requirements','8'),('7 Security requirements','9'),('8 External interfaces','9'),('9 Database requirements','10'),('10 UI/UX requirements','11'),('11 System architecture','11'),('12 Constraints and assumptions','12'),('13 Business processes and workflows','13'),('14 UML and supporting diagrams','14'),('15 Testing and acceptance criteria','14'),('16 Timeline and future scope','20'),('Frontend audit','15–16'),('Backend audit','17–18'),('Integration audit','19')]
for ri,row in enumerate(rows):
    for ci,val in enumerate(row):
        cell=toc.cell(ri,ci)
        cell.text=val
# Rebuild body keeping sectPr and explicit page breaks exactly between each page.
for child in list(body):
    if child.tag!=qn('w:sectPr'): body.remove(child)
sect=body.find(qn('w:sectPr'))
for i,pg in enumerate(ordered):
    for el in pg: body.insert(body.index(sect),deepcopy(el))
    if i<19:
        p=OxmlElement('w:p'); r=OxmlElement('w:r'); br=OxmlElement('w:br'); br.set(qn('w:type'),'page'); r.append(br); p.append(r); body.insert(body.index(sect),p)
# Set A4 and balanced margins.
for s in doc.sections:
    s.page_width=Mm(210); s.page_height=Mm(297)
    s.top_margin=Inches(.70); s.bottom_margin=Inches(.68); s.left_margin=Inches(.75); s.right_margin=Inches(.75)
# Improve body and heading hierarchy without changing the text content.
normal=doc.styles['Normal']; normal.font.name='Aptos'; normal.font.size=Pt(10); normal.font.color.rgb=RGBColor(36,49,63)
normal.paragraph_format.space_after=Pt(5); normal.paragraph_format.line_spacing=1.06
for style_name,size,color in [('Heading 1',16,'12324A'),('Heading 2',12,'087E8B'),('Heading 3',10.5,'12324A')]:
    st=doc.styles[style_name]; st.font.name='Aptos Display' if style_name!='Heading 3' else 'Aptos'; st.font.size=Pt(size); st.font.bold=True; st.font.color.rgb=RGBColor.from_string(color)
    st.paragraph_format.space_before=Pt(8); st.paragraph_format.space_after=Pt(5); st.paragraph_format.keep_with_next=True
# Readable table text, with no forced row heights.
for t in doc.tables:
    for row in t.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                p.paragraph_format.line_spacing=1.02
                p.paragraph_format.space_after=Pt(2)
                for run in p.runs:
                    run.font.name='Aptos'; run.font.size=Pt(8.5)
# Preserve header/footer design; update field pagination uses Word PAGE fields already present.
doc.save(path)
print('Updated DOCX structure:',len(ordered),'explicit pages; section order corrected; A4 and typography updated.')

