from docx import Document
p='Smart_Hospital_Management_System_SRS.docx'; d=Document(p)
t=d.tables[1]
rows=[('SECTION','PAGE'),('1 Overview and introduction','3'),('2 Scope','3'),('3 Target users and roles','4'),('4 Functional requirements','5–7'),('5 Business rules','8'),('6 Non-functional requirements','8'),('7 Security requirements','9'),('8 External interfaces','9'),('9 Database requirements','10'),('10 UI/UX requirements','11'),('11 System architecture','11'),('12 Constraints and assumptions','12'),('13 Business processes and workflows','13'),('14 UML and supporting diagrams','14'),('15 Testing and acceptance criteria','14'),('16 Timeline and future scope','20'),('Frontend audit','15–16'),('Backend audit','17–18'),('Integration audit','19')]
for i,row in enumerate(rows):
 for j,v in enumerate(row): t.cell(i,j).text=v
d.save(p)
print('Contents page corrected.')
