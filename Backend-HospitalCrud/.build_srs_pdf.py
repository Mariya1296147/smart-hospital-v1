import re, html, os
from docx import Document
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from docx.table import Table
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph as RP, Spacer, Table as RT, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

src='Smart_Hospital_Management_System_SRS.docx'; out='Smart_Hospital_Management_System_SRS.pdf'
docx=Document(src); pages=[]; cur=[]
for el in docx.element.body.iterchildren():
    if el.tag==qn('w:sectPr'): continue
    if el.tag==qn('w:p') and el.xpath('.//w:br[@w:type="page"]'):
        clone=Paragraph(el,docx)
        if clone.text.strip(): cur.append(('p',clone))
        pages.append(cur); cur=[]
    elif el.tag==qn('w:p'): cur.append(('p',Paragraph(el,docx)))
    elif el.tag==qn('w:tbl'): cur.append(('t',Table(el,docx)))
if cur: pages.append(cur)
assert len(pages)==20, len(pages)
for n,font,file in [('Arial','arial.ttf',r'C:\Windows\Fonts\arial.ttf'),('Arial-Bold','arialbd.ttf',r'C:\Windows\Fonts\arialbd.ttf'),('Arial-Italic','ariali.ttf',r'C:\Windows\Fonts\ariali.ttf')]:
    if os.path.exists(file): pdfmetrics.registerFont(TTFont(n,file))
NAVY=colors.HexColor('#12324A'); TEAL=colors.HexColor('#087E8B'); INK=colors.HexColor('#24313F'); PALE=colors.HexColor('#EAF3F6'); LINE=colors.HexColor('#C9D6DD'); WHITE=colors.white
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodySRS',fontName='Arial',fontSize=9.15,leading=11.5,textColor=INK,spaceAfter=5,allowWidows=0,allowOrphans=0))
styles.add(ParagraphStyle(name='H1SRS',fontName='Arial-Bold',fontSize=15.5,leading=18,textColor=NAVY,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='H2SRS',fontName='Arial-Bold',fontSize=11.4,leading=13.5,textColor=TEAL,spaceBefore=6,spaceAfter=4,keepWithNext=True))
styles.add(ParagraphStyle(name='SmallSRS',fontName='Arial',fontSize=8.15,leading=9.8,textColor=INK,spaceAfter=1))
styles.add(ParagraphStyle(name='CoverTitle',fontName='Arial-Bold',fontSize=27,leading=31,textColor=WHITE,alignment=TA_LEFT))
styles.add(ParagraphStyle(name='CoverSub',fontName='Arial',fontSize=13,leading=18,textColor=NAVY))
styles.add(ParagraphStyle(name='CellHead',fontName='Arial-Bold',fontSize=7.7,leading=9.1,textColor=WHITE))
styles.add(ParagraphStyle(name='CellBody',fontName='Arial',fontSize=7.65,leading=9.15,textColor=INK))
styles.add(ParagraphStyle(name='BulletSRS',fontName='Arial',fontSize=8.85,leading=11.1,textColor=INK,leftIndent=12,firstLineIndent=-8,spaceAfter=3))
styles.add(ParagraphStyle(name='TocTitle',fontName='Arial-Bold',fontSize=18,leading=22,textColor=NAVY,spaceAfter=8))

def txt(s):
    s=(s or '').replace('\u2192',' → ').replace('\u2013','–').replace('\u2014','-')
    return html.escape(s, quote=False).replace('\n','<br/>')
def cell_p(s,head=False): return RP(txt(s), styles['CellHead' if head else 'CellBody'])
def page_decor(canvas, doc):
    pn=canvas.getPageNumber(); w,h=A4
    canvas.saveState()
    if pn>1:
      canvas.setStrokeColor(LINE); canvas.setLineWidth(.45)
      canvas.line(17*mm,h-14*mm,w-17*mm,h-14*mm)
      canvas.setFont('Arial-Bold',7.4); canvas.setFillColor(NAVY)
      canvas.drawString(18*mm,h-11*mm,'SMART HOSPITAL MANAGEMENT SYSTEM')
      canvas.setFont('Arial',7.1); canvas.setFillColor(TEAL)
      canvas.drawRightString(w-18*mm,h-11*mm,'SOFTWARE REQUIREMENTS SPECIFICATION')
    canvas.setStrokeColor(LINE); canvas.line(17*mm,13*mm,w-17*mm,13*mm)
    canvas.setFont('Arial',7.2); canvas.setFillColor(colors.HexColor('#52616B'))
    canvas.drawString(18*mm,8.5*mm,'Source-based SRS and technical audit')
    canvas.drawRightString(w-18*mm,8.5*mm,f'{pn} / 20')
    canvas.restoreState()

def block_flow(kind,obj,page):
    if kind=='p':
        p=obj; s=p.text.strip()
        if not s: return []
        sty=p.style.name
        if page==0:
            if 'Smart Hospital Management System' in s:
                return [RP(txt(s),styles['CoverSub']),Spacer(1,7*mm)]
            if 'SOFTWARE REQUIREMENTS' in s or 'SPECIFICATION' in s: return []
            return [RP(txt(s),styles['CoverSub']),Spacer(1,2*mm)]
        if page==1 and s=='Document map': return [RP('Contents and document map',styles['TocTitle']),RP('Page references match this corrected 20-page edition.',styles['BodySRS']),Spacer(1,4)]
        if sty.startswith('Heading 1'): return [RP(txt(s),styles['H1SRS'])]
        if sty.startswith('Heading 2'): return [RP(txt(s),styles['H2SRS'])]
        if 'List Bullet' in sty:
            return [RP('• '+txt(s),styles['BulletSRS'])]
        if page==0: return [RP(txt(s),styles['BodySRS'])]
        return [RP(txt(s),styles['BodySRS'])]
    t=obj
    data=[]
    for ri,row in enumerate(t.rows):
        vals=[]
        for c in row.cells: vals.append(cell_p(c.text,ri==0))
        data.append(vals)
    n=len(data[0]) if data else 1; usable= A4[0]-36*mm
    # Proportions guided by recurring schema: IDs/status fields narrow, prose columns broad.
    if n==2: ratios=[.28,.72]
    elif n==3: ratios=[.17,.37,.46]
    elif n==4: ratios=[.16,.28,.28,.28]
    else: ratios=[1/n]*n
    widths=[usable*x for x in ratios]
    tbl=RT(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
    tbl.setStyle(TableStyle([
      ('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),WHITE),
      ('BACKGROUND',(0,1),(-1,-1),WHITE),('ROWBACKGROUNDS',(0,1),(-1,-1),[WHITE,PALE]),
      ('GRID',(0,0),(-1,-1),.45,LINE),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
      ('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),
      ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
    ]))
    return [Spacer(1,2),tbl,Spacer(1,5)]

story=[]
for pi,page in enumerate(pages):
    if pi==0:
        # Distinct cover panel while preserving the original cover title and metadata.
        story += [Spacer(1,31*mm)]
        cover=RT([[RP('SOFTWARE REQUIREMENTS<br/>SPECIFICATION',styles['CoverTitle'])]],colWidths=[A4[0]-40*mm],rowHeights=[45*mm])
        cover.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),NAVY),('LEFTPADDING',(0,0),(-1,-1),12*mm),('RIGHTPADDING',(0,0),(-1,-1),10*mm),('TOPPADDING',(0,0),(-1,-1),8*mm),('BOTTOMPADDING',(0,0),(-1,-1),8*mm)])); story += [cover,Spacer(1,12*mm)]
    for k,o in page:
        story.extend(block_flow(k,o,pi))
    if pi<19: story.append(PageBreak())
# Contract: A4 portrait, safe printable area, no content crosses margins.
pdf=SimpleDocTemplate(out,pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=19*mm,bottomMargin=18*mm,title='Smart Hospital Management System SRS',author='Source-based technical audit')
pdf.build(story,onFirstPage=page_decor,onLaterPages=page_decor)
print('PDF created from revised DOCX:',len(pages),'source page groups')

