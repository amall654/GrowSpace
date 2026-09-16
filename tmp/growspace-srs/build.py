from pathlib import Path
from copy import deepcopy
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha256
import json, re, sys
from lxml import etree
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from docx.text.paragraph import Paragraph
from docx.table import Table
from docx.enum.text import WD_ALIGN_PARAGRAPH
from content import *

BASE=Path(__file__).parent
ROOT=BASE.parents[1]
OUT=ROOT/'output'/'documents'
REF=Path('C:/Users/HP/.codex/plugins/cache/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-system-design/assets/reference.docx')
APPROVED='--approved' in sys.argv
VERSION='1.0' if APPROVED else '0.11'
STATUS='متطلبات معتمدة للنسخة الأولى' if APPROVED else 'مسودة للمراجعة والاعتماد'
NAVY='082A4A'; BLUE='2F6B9A'; MUTED='5A728D'
OUT.mkdir(parents=True,exist_ok=True)

def font(n,bold=False): return ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',n)
def diagram_canvas(title,sub):
    im=Image.new('RGB',(2200,1300),'#F7FAFD'); dr=ImageDraw.Draw(im)
    dr.rectangle((0,0,2200,145),fill='#'+NAVY)
    dr.text((65,30),title,font=font(45,True),fill='white')
    dr.text((65,91),sub,font=font(27),fill='#D1E3F2')
    return im,dr
def box(dr,xy,title,lines,fill='#FFFFFF'):
    dr.rounded_rectangle(xy,radius=14,fill=fill,outline='#'+BLUE,width=3)
    x1,y1,x2,y2=xy
    dr.text(((x1+x2)/2,y1+30),title,anchor='mt',font=font(35,True),fill='#'+NAVY)
    for i,line in enumerate(lines):dr.text(((x1+x2)/2,y1+85+i*40),line,anchor='mt',font=font(27),fill='#233447')
def arrow(dr,pts,label=None,lp=None):
    dr.line(pts,fill='#'+BLUE,width=5)
    x,y=pts[-1]; px,py=pts[-2]
    import math
    a=math.atan2(y-py,x-px); size=18
    dr.polygon([(x,y),(x-size*math.cos(a-.5),y-size*math.sin(a-.5)),(x-size*math.cos(a+.5),y-size*math.sin(a+.5))],fill='#'+BLUE)
    if label:dr.text(lp,label,font=font(25),fill='#'+NAVY)

def make_diagrams():
    im,d=diagram_canvas('GrowSpace system context','Target web release | authentication and private study data')
    box(d,(60,350,470,570),'Student / Visitor',['Web browser','Arabic or English'])
    box(d,(700,295,1370,675),'GrowSpace Website',['Account and daily dashboard','Tasks, courses and schedule','Optional library and focus timer'],'#E5F0F8')
    box(d,(1670,280,2140,530),'Firebase',['Authentication','Firestore + Security Rules'])
    box(d,(1670,830,2140,1040),'Google',['Identity provider only'])
    box(d,(770,900,1300,1130),'Fixed preview examples',['Built into the website','Read-only | no user storage'])
    box(d,(60,900,650,1130),'Local account drafts',['Partitioned by account ID','Unsynced until server confirms'])
    arrow(d,[(850,675),(850,790),(350,790),(350,900)],'Account drafts',(400,742))
    arrow(d,[(470,445),(700,445)],'UI actions',(480,393))
    arrow(d,[(1370,410),(1670,410)],'Session + data',(1400,355))
    arrow(d,[(1670,485),(1370,485)],'Results / errors',(1400,503))
    arrow(d,[(1900,530),(1900,830)],'Identity exchange',(1930,660))
    arrow(d,[(1030,900),(1030,675)],'Preview examples',(1060,760))
    d.text((65,1210),'Boundary: no mobile app, push notifications, public sharing or launch waitlist.',font=font(28),fill='#'+MUTED)
    im.save(BASE/'context.png')

    im,d=diagram_canvas('GrowSpace use cases','UC01 to UC12 | external actors and user-visible capabilities')
    d.rounded_rectangle((520,205,1750,1180),radius=15,outline='#'+BLUE,width=3,fill='white')
    d.text((1135,227),'GrowSpace system boundary',anchor='mt',font=font(31,True),fill='#'+NAVY)
    def actor(x,y,name,sub):
        d.ellipse((x-28,y,x+28,y+56),outline='#'+NAVY,width=4); d.line((x,y+56,x,y+140),fill='#'+NAVY,width=4)
        d.line((x-50,y+95,x+50,y+95),fill='#'+NAVY,width=4);d.line((x,y+140,x-45,y+200),fill='#'+NAVY,width=4);d.line((x,y+140,x+45,y+200),fill='#'+NAVY,width=4)
        d.text((x,y+220),name,anchor='mt',font=font(30,True),fill='#'+NAVY);d.text((x,y+263),sub,anchor='mt',font=font(23),fill='#'+MUTED)
    actor(240,440,'Student','Authenticated user')
    actor(1990,440,'Visitor','Before authentication')
    cases=[('UC04  Profile and goal',0),('UC05  Courses',0),('UC06  Tasks',0),('UC07  Schedule',0),('UC08  Daily overview',0),('UC10  Library and notes',0),('UC01  Email account',1),('UC02  Google sign-in',1),('UC03  Password reset',1),('UC09  Focus timer',1),('UC11  Language / pages',1),('UC12  Read-only preview',1)]
    for j,(s,col) in enumerate(cases):
        row=j%6; x=565+col*605; y=315+row*137
        d.line(((295,535) if col==0 or s.startswith('UC09') else (1935,535),(x if col==0 or s.startswith('UC09') else x+530,y+46)),fill='#ABC0D0',width=2)
    for j,(s,col) in enumerate(cases):
        row=j%6;x=565+col*605;y=315+row*137
        d.ellipse((x,y,x+530,y+96),fill='#E7F1F9',outline='#'+BLUE,width=2)
        d.text((x+265,y+47),s,anchor='mm',font=font(28,True),fill='#'+NAVY)
    d.text((65,1220),'UC09 serves students only; UC11 is shared; Google participates in UC02 via Firebase.',font=font(27),fill='#'+MUTED)
    im.save(BASE/'usecases.png')

    im,d=diagram_canvas('GrowSpace conceptual data model','Meaning and ownership | conceptual additions are not database migrations')
    boxes=[((785,205,1415,405),'User',['Firebase Authentication']),((60,600,590,810),'Course',['Name | optional code']),((820,590,1380,870),'Task',['Title | due date | priority','Done | completed at','Optional course reference']),((1610,600,2140,880),'Schedule event',['Title | local time | kind','Weekly day OR exam date','Optional course reference']),((75,990,650,1210),'Profile',['Display name | weekly goal']),((1500,990,2110,1210),'Book',['Title | author | status','Progress | personal note'])]
    for xy,title,lines in boxes:box(d,xy,title,lines,fill='#E7F1F9' if title=='User' else 'white')
    arrow(d,[(960,405),(960,490),(325,490),(325,600)],'1 : 0..*',(510,455))
    arrow(d,[(1100,405),(1100,590)],'1 : 0..*',(1125,475))
    arrow(d,[(1240,405),(1240,490),(1875,490),(1875,600)],'1 : 0..*',(1540,455))
    arrow(d,[(820,270),(35,270),(35,960),(350,960),(350,990)],'1 : 1 profile',(60,285))
    arrow(d,[(1415,270),(2170,270),(2170,960),(1790,960),(1790,990)],'1 : 0..* books',(1780,285))
    arrow(d,[(590,690),(820,690)],'0..1 course',(608,640))
    arrow(d,[(590,800),(680,800),(680,925),(1525,925),(1525,805),(1610,805)],'0..1 course per event',(860,935))
    im.save(BASE/'data-model.png')

def distill():
    z=ZipFile(REF); inv={n:{'size':len(z.read(n)),'sha256':sha256(z.read(n)).hexdigest()} for n in z.namelist()}
    (BASE/'reference-inventory.json').write_text(json.dumps(inv,indent=2),encoding='utf8')
    (BASE/'artifact.md').write_text(f'''# GrowSpace SRS template contract
Reference: {REF}
SHA256: {sha256(REF.read_bytes()).hexdigest()}
Evidence: reference.pdf and ref-1.png through ref-7.png; all seven pages inspected.
Page system: one section, US Letter 8.5 x 11 in; margins top/left/right 0.7 in, bottom 0.6201389 in. Preserve sectPr including header/footer distances and first-page behavior.
Typography: reference Arial document default; Title 22 pt bold navy 082A4A; Heading 1 13.5 pt bold navy; body dark 233447, after 5.5 pt, line 1.25. Preserve styles and theme. Arabic request permits RTL paragraph direction and Arabic-compatible Arial runs, body 11 pt, headings 13.5/12 pt, while retaining hierarchy.
Cover: spacious two-title block; status/date/owner metadata and compact key-value table; replace all template identity slots with GrowSpace metadata. No invented people or organizations.
Tables: clone reference table index 2 (Table3), navy header and blue/white body; fixed width 7.1 in; centered tables; reuse tcPr patterns, repeating heading and unsplit row. Reflow column counts for source, matrix and field inventories.
Figures: replace architecture placeholder with three target-specific figures in the original blue visual palette, each captioned in Arabic. Diagrams use English technical labels with Arabic explanations.
Footers: replace organization/RFC text with GrowSpace SRS, version and PAGE field, retaining footer arrangement. Template instructional footnote is intentionally removed.
Slots: word/document.xml body after metadata is replaced by the user-approved SRS content sequence using cloned paragraph/table/figure patterns. All placeholder prose, source example figure, footnote marker and example URLs are editable/removable. Page/section geometry is preserved; added body pages repeat the same page system. Paragraphs with Heading 1 are major SRS sections; grouped requirements use Heading 2.
Preservation: retain every original ZIP part byte-for-byte except document.xml, its relationships, footer text, footnotes instructional text, settings updateFields, core metadata and content types as needed. New media parts permitted. No source changes.
Fields: add real TOC/PAGE fields and refresh using Word before export. Final Word and PDF share a Word-rendered layout.
Fidelity: inspect every output page, all diagrams, RTL text, tables, footer and TOC. Check reference hash unchanged and preserve-only part hashes equal.
''',encoding='utf8')

make_diagrams();distill()
doc=Document(REF)
body=doc._element.body
paragraph_pattern=deepcopy(doc.paragraphs[22]._p)
table_pattern=deepcopy(doc.tables[2]._tbl)
for child in list(body):
    if child.tag!=qn('w:sectPr'): body.remove(child)
doc.core_properties.title='GrowSpace متطلبات البرمجيات لنسخة الويب'
doc.core_properties.subject='Software Requirements Specification'
doc.core_properties.author=''
doc.core_properties.last_modified_by=''
doc.core_properties.version=VERSION
doc.core_properties.comments=''

def clean_p(p):
    for ch in list(p._p):
        if ch.tag!=qn('w:pPr'):p._p.remove(ch)
    pp=p._p.get_or_add_pPr()
    for tag in ['numPr','pBdr','rPr','sectPr']:
        for e in list(pp.findall(qn('w:'+tag))):pp.remove(e)

def rtl(p,value=True):
    pp=p._p.get_or_add_pPr(); e=pp.find(qn('w:bidi'))
    if e is None:e=OxmlElement('w:bidi');pp.append(e)
    e.set(qn('w:val'),'1' if value else '0')
    # In Word's bidi paragraphs the left/start justification is the visual right edge.
    p.alignment=WD_ALIGN_PARAGRAPH.LEFT

latin_re=re.compile(r'([A-Za-z0-9][A-Za-z0-9_./:%+\-]*(?: [A-Za-z0-9][A-Za-z0-9_./:%+\-]*)*)')
def text_runs(p,text,bold=False,size=11,color='233447'):
    for s in latin_re.split(str(text)):
        if not s:continue
        run=p.add_run(s);run.font.name='Arial';run.font.size=Pt(size);run.font.bold=bold;run.font.color.rgb=RGBColor.from_string(color)
        rp=run._element.get_or_add_rPr();fonts=rp.find(qn('w:rFonts'))
        for attr in ['ascii','hAnsi','cs','eastAsia']:fonts.set(qn('w:'+attr),'Arial')
        is_ltr=p._p.get_or_add_pPr().find(qn('w:bidi')).get(qn('w:val'))=='0'
        e=OxmlElement('w:rtl');e.set(qn('w:val'),'0' if is_ltr or latin_re.fullmatch(s) else '1');rp.append(e)
        e=OxmlElement('w:szCs');e.set(qn('w:val'),str(int(size*2)));rp.append(e)
        if bold:e=OxmlElement('w:bCs');rp.append(e)

def p(text='',bold=False,size=11,style=None,after=5.5,keep=False):
    el=deepcopy(paragraph_pattern);body.insert(len(body)-1,el);para=Paragraph(el,doc._body)
    clean_p(para)
    para.style=style or 'normal';rtl(para)
    para.paragraph_format.space_before=Pt(0);para.paragraph_format.space_after=Pt(after)
    para.paragraph_format.line_spacing=1.2;para.paragraph_format.keep_with_next=keep or str(text).startswith('معيار القبول:')
    para.paragraph_format.widow_control=True
    text_runs(para,text,bold,size)
    return para

heading_number=0
def h(text,level=1,new=False):
    para=p(text,True,13.5 if level==1 else 12,'Heading 1' if level==1 else 'Heading 2',after=8,keep=True)
    para.paragraph_format.space_before=Pt(12 if not new else 0)
    if new:para.paragraph_format.page_break_before=True
    for r in para.runs:r.font.color.rgb=RGBColor.from_string(NAVY)
    return para

def tbl(headers,rows,widths=None):
    widths=widths or [7.1/len(headers)]*len(headers)
    el=deepcopy(table_pattern)
    for old in list(el.findall(qn('w:tr'))):el.remove(old)
    grid=el.find(qn('w:tblGrid'));grid.clear()
    for width in widths:
        col=OxmlElement('w:gridCol');col.set(qn('w:w'),str(int(width*1440)));grid.append(col)
    prop=el.find(qn('w:tblPr'))
    bidi=OxmlElement('w:bidiVisual');prop.append(bidi)
    body.insert(len(body)-1,el)
    source_rows=table_pattern.findall(qn('w:tr'))
    for i,values in enumerate([headers]+list(rows)):
        tr=deepcopy(source_rows[0 if i==0 else 1])
        for c in list(tr.findall(qn('w:tc'))):tr.remove(c)
        cells=source_rows[0 if i==0 else 1].findall(qn('w:tc'))
        for j,value in enumerate(values):
            tc=deepcopy(cells[min(j,len(cells)-1)])
            for ch in list(tc):
                if ch.tag!=qn('w:tcPr'):tc.remove(ch)
            pr=tc.find(qn('w:tcPr'))
            w=pr.find(qn('w:tcW'))
            if w is None:w=OxmlElement('w:tcW');pr.append(w)
            w.set(qn('w:w'),str(int(widths[j]*1440)));w.set(qn('w:type'),'dxa')
            shd=pr.find(qn('w:shd'))
            if shd is not None:shd.set(qn('w:fill'),NAVY if i==0 else ('E5F0F8' if i%2 else 'F5F8FB'))
            pe=OxmlElement('w:p');tc.append(pe);pa=Paragraph(pe,doc._body);rtl(pa)
            pa.paragraph_format.space_before=Pt(1);pa.paragraph_format.space_after=Pt(1);pa.paragraph_format.line_spacing=1.1
            text_runs(pa,value,i==0,10,'FFFFFF' if i==0 else '233447')
            tr.append(tc)
        el.append(tr)
    return Table(el,doc._body)

def figure(name,caption):
    para=p('',after=4);para.alignment=WD_ALIGN_PARAGRAPH.CENTER
    run=para.add_run();shape=run.add_picture(str(BASE/name),width=Inches(7.05))
    shape._inline.docPr.set('descr',caption)
    para.paragraph_format.keep_with_next=True
    pa=p(caption,size=10,after=10);pa.alignment=WD_ALIGN_PARAGRAPH.CENTER

def field(p,instruction):
    r=p.add_run();a=OxmlElement('w:fldChar');a.set(qn('w:fldCharType'),'begin');r._r.append(a)
    r=p.add_run();a=OxmlElement('w:instrText');a.set(qn('xml:space'),'preserve');a.text=instruction;r._r.append(a)
    r=p.add_run();a=OxmlElement('w:fldChar');a.set(qn('w:fldCharType'),'separate');r._r.append(a)
    text_runs(p,'0' if instruction.strip()=='PAGE' else 'سيُحدَّث الفهرس عند الإخراج',False,8 if instruction.strip()=='PAGE' else 10)
    r=p.add_run();a=OxmlElement('w:fldChar');a.set(qn('w:fldCharType'),'end');r._r.append(a)

# Cover based on the reference's title, generous space and metadata pattern.
title=p('GrowSpace',False,22,'Title',after=7);title.paragraph_format.space_before=Pt(115)
for r in title.runs:r.font.color.rgb=RGBColor.from_string(MUTED)
title=p('متطلبات البرمجيات لنسخة الويب',True,22,'Title',after=14)
for r in title.runs:r.font.color.rgb=RGBColor.from_string(NAVY)
p('Software Requirements Specification',size=13,after=10)
p('مرجع لتوثيق المتطلبات وتوجيه التطوير والقبول',size=12,after=80)
tbl(['الحالة','الإصدار','التاريخ'],[[STATUS,VERSION,'10 سبتمبر 2026']],[3.5,1.3,2.3])
p('',after=10)
tbl(['البيان','القيمة'],[
('المنتج','GrowSpace منصة لتنظيم دراسة طلاب الجامعات'),
('صاحب القرار والمراجعة','مالك المشروع'),
('الجمهور','مالك المشروع وفريق التطوير والاختبار'),
('المرجع','استرشاد بمعيار ISO/IEC/IEEE 29148:2018'),
('النطاق','نسخة الويب الأولى مع Google ومكتبة قراءة اختيارية'),
],[1.6,5.5])

h('ضبط المستند وفهرس المحتويات',new=True)
p('يحدد هذا المستند السلوك المستهدف للنسخة الأولى من GrowSpace. يُستخدم لتقييم اكتمال التطوير وقبول الوظائف، وترد ملاحظات التنفيذ الحالي في ملحق منفصل حتى لا تتحول قيود النسخة الأولية إلى متطلبات للمنتج.')
tbl(['الإصدار','التاريخ','التغيير','الحالة'],[['0.9','2026-09-06','تحديد النطاق والمتطلبات والقبول والتتبع والمخططات',STATUS],['0.9','2026-09-07','تعليق المراجعة 1: اقتراح خيارات حذف المادة وأعداد العناصر المتأثرة','تحديث مقترح D03'],['0.9','2026-09-08','توجيه S11: مسودات انتهاء الجلسة واستعادتها وعزلها','تحديث D04'],['0.10','2026-09-08','S12: معاينة للعرض فقط','نطاق المعاينة معتمد'],[VERSION,'2026-09-10','S14 وS16: Firebase ونقل الحسابات والبيانات','الخدمة والنقل معتمدان']],[.7,1.1,3.6,1.7])
p('حالة اعتماد القرارات: '+('اعتمد مالك المشروع الحزمة D01 إلى D08 في المحادثة. اعتماد المتطلبات لا يعني نجاح اختبارات التطبيق أو جاهزيته للإطلاق.' if APPROVED else 'النطاق معتمد وفق S01، وتوجيها المسودات والمعاينة معتمدان وفق S11 وS12. يبقى اعتماد الحزمة التفصيلية D01 إلى D08 ككل معلقًا؛ المستند للمراجعة حتى استكماله.'),bold=True)
p('إدارة التغيير: يحتفظ كل متطلب بمعرّفه عند تعديل صياغته. يوثق أي تغيير لاحق بسببه وأثره على النطاق والبيانات والاختبارات، ويُحدّث الإصدار ومصفوفة التتبع قبل اعتماد التغيير.')
h('فهرس المحتويات',2)
field(p(), ' TOC \\o "1-1" \\h \\z \\u ')

h('1 المقدمة',new=True)
h('1.1 الغرض والجمهور',2)
p('تساعد GrowSpace الطالب على جمع مهامه ومواده ومحاضراته واختباراته في مساحة شخصية واحدة، مع نظرة يومية ومؤقت تركيز ومكتبة قراءة اختيارية. يحدد هذا المستند ما يجب أن تقدمه النسخة الأولى وكيف يُتحقق منه. يراجع مالك المشروع ملاءمة المتطلبات، ويستخدمها المطور لتحديد السلوك، ويستخدمها المختبر لبناء أدلة القبول.')
h('1.2 حدود النطاق',2)
tbl(['داخل النسخة الأولى','خارج النسخة الأولى'],[
('الحساب بالبريد وGoogle واستعادة كلمة المرور','تطبيق جوال مستقل ولوحة إدارة جديدة'),
('المواد والمهام والمحاضرات والاختبارات والهدف الأسبوعي','مزامنة تقويم خارجي أو تكامل مع نظام جامعة'),
('لوحة الطالب وتذكيرات داخلية ومؤقت 25 دقيقة','إشعارات خارجية وسجل جلسات التركيز'),
('مكتبة شخصية وتقدم وملخصات','أهداف قراءة مستقلة ومشاركة عامة وتوصيات كتب'),
('العربية والإنجليزية ومعاينة للعرض فقط وحفظ حساب موثوق','قائمة انتظار الإطلاق وتجربة قابلة للتعديل أو حفظ أمثلة المعاينة'),
],[3.55,3.55])
p('استُبدلت التجربة القابلة للتعديل بالمعاينة وفق S12. يجب أن يقتصر وصف المنتج عند التسليم على الوظائف التي يمكن استخدامها فعليًا؛ نموذج قائمة الانتظار الحالي ليس متطلبًا لجمع اشتراكات في هذه النسخة.')
p('اعتمد المستخدم Firebase بدل Supabase ونقل الحسابات والبيانات الفعلية وفق S14 وS16. رفع الملفات مستبعد. الذكاء الاصطناعي للتنظيم والقراءة مقترح توسع منفصل يحتاج متطلبات وقبولًا قبل إدخاله؛ لا يدعي هذا الإصدار أنه منفذ.')
h('1.3 التعريفات والاصطلاحات',2)
tbl(['المصطلح','المعنى'],[
('SRS','مواصفة متطلبات البرمجيات التي تصف السلوك والقيود ومعايير القبول.'),
('FR / NFR / IF','متطلب وظيفي / غير وظيفي / واجهة خارجية.'),
('UC / TC','حالة استخدام / سيناريو تحقق وقبول.'),
('Security Rules','قواعد Firestore للتحقق من هوية الطلب وملكية الوثيقة ومدخلاتها.'),
('OAuth','تدفق تفويض يستخدم هنا لإثبات هوية Google عبر Firebase.'),
('RTL / LTR','اتجاه عرض من اليمين لليسار / من اليسار لليمين.'),
('الطالب والزائر','صاحب جلسة حساب صحيحة، أو مستخدم للصفحات العامة والمعاينة دون حساب.'),
('الأولوية P1 وP2','P1 أساس الحساب والتنظيم والموثوقية؛ P2 الوظائف المساندة. كلاهما مطلوب لقبول النطاق المعتمد؛ المكتبة اختيارية للطالب لا للفريق.'),
],[1.5,5.6])

h('2 الوصف العام وسياق المنتج',new=True)
h('2.1 المشكلة والقيمة',2)
p('تشتت المحاضرات والواجبات والاختبارات بين أدوات متعددة يصعّب ترتيب يوم الطالب. تجمع المنصة هذه البيانات في واجهة واحدة، وتربط إكمال المهام بالمؤشرات اليومية والأسبوعية. يستطيع الطالب تجاهل المكتبة والتركيز على التنظيم الأكاديمي دون أي عائق.')
h('2.2 المستخدمون والبيئة',2)
p('المستخدم الأساسي طالب جامعي يدير بياناته بنفسه. الزائر يستطيع الاطلاع على الصفحات العامة ومعاينة الأمثلة الثابتة. Google وFirebase خدمات خارجية وليستا دورين بشريين. لا يضيف المستند صلاحيات مشرف أو معلم أو جامعة.')
p('يعمل الموقع عبر المتصفح. التطبيق الحالي Next.js وTypeScript مع Tailwind CSS، ويستخدم Firebase Authentication للمصادقة وCloud Firestore للبيانات. يعرّف إعداد النشر تصديرًا ثابتًا إلى GitHub Pages. يشكل ذلك قيدًا تقنيًا قائمًا؛ لا يفترض المستند وجود خادم Next.js وقت التشغيل أو خدمة جوال مشتركة.')
figure('context.png','الشكل 1 سياق النظام وحدود بيانات الحساب وأمثلة المعاينة')
p('يرسل المتصفح طلبات الحساب والجلسة إلى Firebase. يستخدم Google للهوية فقط؛ لا يتلقى محتوى الدراسة. المعاينة تعرض أمثلة مضمّنة فقط ولا تقرأ التخزين أو تتصل بخدمة الحساب. مسودات الحساب هدف مستقل ضمن مسار الحساب. وجود مسودة محلية لا يعني نجاح الكتابة إلى Firebase. تفاصيل دورة المسودة في القسم 6.3.')
h('2.3 الاعتماديات والقيود',2)
p('تحتاج وظائف الحساب اتصالًا بالخدمة، وتحتاج استعادة البريد ودخول Google إعدادات موفر صحيحة وعناوين عودة مسموحة. لا يدّعي هذا المستند أن تلك الإعدادات المنشورة قد اختُبرت. لا يضمن وضع الحساب العمل دون اتصال؛ تعالج حالات الانقطاع صراحة. حذف الحساب النهائي خدمة تشغيلية خارج واجهات هذه النسخة؛ لا تُخترع لها مهلة أو سياسة احتفاظ غير متفق عليها.')

h('3 الواجهات الخارجية',new=True)
for id,title,shall,ac,src,tc in INTERFACES:
    h(id+'  '+title,2);p(shall)
    p('معيار القبول: '+ac)
    p('المصدر: '+src+' | التحقق: '+tc+' | الأولوية: P1',size=10)
p('مسارات الموقع الحالية: / و/login و/auth و/preview و/demo و/dashboard و/forgot-password و/reset-password و/privacy و/terms. /auth مدخل بديل للمصادقة، و/demo مدخل قديم للمعاينة الجديدة فقط. تبقى المسارات ملحقة بمسار النشر الأساسي إن وجد، ولا يتضمن المستند عنوان مشروع Firebase أو مفاتيحه الفعلية.')
p('لا تُعرّف واجهة API عامة جديدة في هذه النسخة. التزامات IF تحدد المدخلات والمخرجات المرئية وحدود التكامل، بينما يبقى اختيار تفاصيل تنفيذ الطلبات ضمن التصميم التقني بما يحقق هذه المتطلبات.')

h('4 المتطلبات الوظيفية',new=True)
p('كل عبارة «يجب» أدناه التزام للنسخة المستهدفة عند اعتمادها. معيار القبول هو النتيجة المرصودة المطلوبة وليس تقرير اختبار ناجح. مصدر S01 قرار النطاق، والمصادر البرمجية قرائن على الوظيفة الحالية؛ الإشارة D تعني قاعدة مفصلة موثقة في سجل القرارات.')
requirements=[]
for gi,(code,title,need,uc,src,reqs) in enumerate(GROUPS):
    h(f'4.{gi+1} {title}',2,new=False)
    for suffix,label,shall,ac,dec,tc in reqs:
        id='FR-'+code+'-'+suffix
        priority='P2' if code in ('LIB','FOC','DEM') else 'P1'
        pa=p(id+'  '+label,True,11,after=3,keep=True)
        p(shall,after=3,keep=True)
        p('معيار القبول: '+ac,after=3)
        p('المصدر: '+src+('؛ '+dec if dec else '')+' | الأولوية: '+priority+' | التحقق: '+tc,size=9.5,after=10)
        mapped_uc = uc
        if code == 'AUTH':
            mapped_uc = {'001':'UC01','002':'UC01','003':'UC02','004':'UC03','005':'UC03','006':'مشترك للحساب','007':'مشترك للحساب'}[suffix]
        requirements.append(dict(id=id,need=need,uc=mapped_uc,tc=tc,source=src,decision=dec,priority=priority))


h('5 حالات الاستخدام',new=True)
figure('usecases.png','الشكل 2 حالات الاستخدام الرئيسية وعلاقتها بالطالب والزائر')
p('الخطوط تمثل ارتباط الممثل بحالة الاستخدام. يشترك الطالب والزائر في تغيير اللغة؛ المؤقت للحساب فقط. المعاينة تتيح التنقل وعرض أمثلة ثابتة دون تعديل. Google مشارك خارجي في UC02 عبر Firebase. التفاصيل التالية تميز نجاح التدفق عن بدائله وفشله.')
p('تدفق مشترك لحالات تعديل الملف والمواد والمهام والمواعيد والمكتبة: عند انتهاء الجلسة تُحفظ المدخلات المعلقة محليًا، وبعد دخول صاحبها مجددًا يراجعها ويعيد حفظها أو يتجاهلها. تبقى منفصلة عن نتائج الخادم حتى تأكيد الكتابة؛ وتُعالج حدود التخزين والتعارض وفق FR-DAT-004 وFR-DAT-005.')
for id,title,actor,pre,flow,alt,post in USECASES:
    h(id+'  '+title,2)
    p('الممثل والشروط المسبقة: '+actor+'؛ '+pre,keep=True)
    p('التدفق الأساسي: '+flow,keep=True)
    p('البدائل والأخطاء: '+alt,keep=True)
    p('النتيجة: '+post)

h('6 البيانات وقواعد العمل',new=True)
figure('data-model.png','الشكل 3 نموذج البيانات المفاهيمي والملكية والعلاقات الاختيارية')
p('يمتلك كل حساب ملفًا واحدًا وصفرًا أو أكثر من المواد والمهام والمواعيد والكتب. ترتبط المهمة أو الموعد بصفر أو مادة واحدة من حساب صاحبها؛ وقد ترتبط المادة بعدة عناصر. الإشارة 1 : 0..* تعني ملكية حساب واحد لعدد غير محدد مسبقًا من العناصر. يمثل المخطط المفاهيم والعلاقات ولا يفرض مخطط مجموعات Firestore تفصيليًا.')
tbl(['الكيان','البيانات الأساسية','قيود المعنى'],[
('الحساب والملف','هوية الحساب؛ اسم العرض؛ الهدف الأسبوعي','الاسم غير فارغ؛ الهدف عدد صحيح 1 إلى 99؛ لا تُخزن كلمة المرور ضمن الملف.'),
('المادة','معرف ثابت؛ المالك؛ الاسم؛ الرمز الاختياري','الاسم للعرض وليس مفتاح الربط؛ المالك هو صاحب الجلسة.'),
('المهمة','معرف؛ مالك؛ عنوان؛ مادة اختيارية؛ تاريخ استحقاق؛ أولوية؛ حالة؛ وقت إكمال','وقت الإكمال مطلوب لحساب الأسبوع عند اكتمالها وفارغ عند إعادة فتحها.'),
('الموعد','معرف؛ مالك؛ عنوان؛ مادة اختيارية؛ نوع؛ وقت؛ يوم أسبوع أو تاريخ','المحاضرة لها يوم أسبوع، والاختبار له تاريخ؛ لا يُعامل الاختبار كتكرار أسبوعي.'),
('الكتاب','معرف؛ مالك؛ عنوان؛ مؤلف اختياري؛ حالة؛ تقدم؛ ملخص اختياري','التقدم عدد صحيح من 0 إلى 100 والحالة متسقة معه؛ الملخص شخصي.'),
],[1,3.1,3])
h('6.1 قواعد التحقق المشتركة',2)
p('يُرفض الاسم أو العنوان الإلزامي إذا لم يبق منه نص بعد إزالة الفراغات المحيطة. تُقبل الحقول الاختيارية فارغة دون استبدالها بسجل مادة أو مؤلف وهمي. تُرفض التواريخ والأوقات غير الصالحة والأولويات والحالات غير المعروفة في الواجهة والخدمة. لا يُقبل ارتباط بمادة يملكها حساب آخر.')
p('تاريخ الاستحقاق والاختبار تاريخ تقويمي ميلادي مستقل عن وقت اليوم. تعرض الواجهة التاريخ بصياغة اللغة المختارة دون تغيير اليوم المخزن. يجوز حفظ مهمة أو اختبار بتاريخ ماضٍ؛ المهمة غير المكتملة تصبح متأخرة، والاختبار الماضي لا يظهر ضمن الموعد القادم. تتاح الأيام السبعة للمحاضرات دون إضافة فترة فصل دراسي في هذه النسخة.')
h('6.2 الزمن والمؤشرات',2)
p('تستخدم تصنيفات اليوم والأسبوع المنطقة الزمنية الحالية للمتصفح. يسجل وقت إكمال المهمة كلحظة زمنية قابلة للتحويل إلى هذه المنطقة. تغيير منطقة المتصفح يعيد الحساب عند إعادة العرض. تُعاد تصنيفات اللوحة والتذكيرات عند عرضها أو استئنافها بعد عبور منتصف الليل. إذا تغير توقيت محلي بسبب منطقة زمنية، تبقى أوقات المحاضرات أوقاتًا محلية؛ لا توجد مزامنة تقويم خارجي.')
p('إجمالي المكتمل هو عدد المهام التي حالتها مكتملة؛ المتبقي هو عدد غير المكتملة. هدف الأسبوع يقيس إكمال المهام في الفترة وليس تواريخ استحقاقها. التذكيرات القادمة تشمل بعد اليوم وحتى اليوم السابع، وتستبعد المكتمل. نسبة المكتبة هي متوسط نسب الكتب، مقربة لأقرب عدد صحيح، أو 0% للمكتبة الفارغة.')
h('6.3 دورة الحياة والاتساق',2)
p('إنشاء عنصر يولد هوية ثابتة وملكية للحساب. التعديل لا يغير الهوية. وفق مقترح D03، حذف المادة يتيح فك ارتباط عناصرها أو حذفها جميعًا، مع عدد المهام والمواعيد والإجمالي وتأكيد الأثر المختار. يشمل العدد المهام المكتملة وجميع المواعيد المرتبطة. لا تتأثر عناصر مادة أخرى ولو تشابه الاسم؛ وتُحدث المؤشرات والتذكيرات بعد النجاح. تغير المجموعة المتأثرة يستلزم عرض الأعداد والتأكيد مجددًا. لا يُعلن نجاح قبل تأكيد الخدمة، ولا يُعرض الفشل الجزئي كنجاح؛ تُتاح إعادة المحاولة وفق FR-DAT.')
p('عند انتهاء الجلسة أو تسجيل الخروج تُخفى بيانات الحساب ومسوداته من الواجهة. المسودة سجل محلي يتضمن معرف صاحبها ونوع العنصر ومدخلاته ومعرفه إن وجد، ووقت التعديل وهوية محاولة الحفظ لمنع التكرار. تبقى عبر إعادة التحميل في المتصفح نفسه حتى نجاح المزامنة أو تجاهلها؛ مسح المستخدم بيانات الموقع يزيلها. لا تحفظ كلمات المرور أو رموز الجلسة داخل المسودة، ولا تقرأ المعاينة هذه المسودات أو تعدلها.')
p('بعد إعادة الدخول تُقرأ الحالة المؤكدة من الخادم، ثم تُعرض مسودات الحساب نفسه بوسم «مسودة محلية غير متزامنة» دون إدراجها ضمن مؤشرات الإنجاز المؤكدة. يراجع المستخدم المسودة قبل الحفظ أو التجاهل؛ فشل القراءة أو الكتابة يبقيها معلقة. إذا تغير العنصر أو حُذف على الخادم، يُعرض ذلك للمراجعة ولا تستبدله المسودة تلقائيًا. لا تُعاد أوامر الحذف تلقائيًا. إذا تعذر التخزين المحلي، يظهر تنبيه بعدم ضمان الاستعادة مع إبقاء المدخلات في الذاكرة أثناء بقاء الصفحة، وإخفائها حتى إعادة الدخول؛ ولا تُعلن كتابة محلية أو سحابية ناجحة دون تأكيدها.')

h('7 المتطلبات غير الوظيفية',new=True)
for id,title,shall,ac,src,dec,tc in NFR:
    h(id+'  '+title,2)
    p(shall,keep=True);p('معيار القبول: '+ac)
    p('المصدر: '+src+('؛ '+dec if dec else '')+' | الأولوية: P1 | التحقق: '+tc,size=9.5,after=10)
    requirements.append(dict(id=id,need='N10' if any(x in id for x in ('SEC','REL','PRI')) else 'N08',uc='غير وظيفي',tc=tc,source=src,decision=dec,priority='P1'))
p('متطلبات الجودة السابقة حدود قبول للمنتج المقصود، ولا تمثل قياسات للحالة الحالية. لا يدّعي المستند امتثالًا كاملًا لمعيار إمكانية وصول بعينه أو اتفاقية توفر إنتاجية غير مقاسة.')

h('8 التحقق والقبول',new=True)
h('8.1 أسلوب التحقق',2)
p('تُنفذ السيناريوهات على بيئة اختبار وبحسابات وبيانات غير إنتاجية. تُسجل لكل سيناريو نسخ التطبيق والمتصفح، والبيانات المدخلة، والخطوات، والنتيجة الفعلية، والدليل، وحالة ناجح أو فاشل أو لم يُنفذ. يثبت فحص الوثيقة صحة الصياغة والتتبع فقط؛ أما تحقق سلوك النظام فيتطلب تنفيذ السيناريوهات على التطبيق.')
p('يُقبل نطاق النسخة بعد اجتياز جميع معايير IF وFR وNFR المرتبطة به وحسم القرارات، مع خلوه من فشل يمنع حفظ البيانات أو يكشف بيانات حساب آخر. تبقى P2 مطلوبة للتسليم رغم أن استخدامها اختياري للطالب. تعاد الاختبارات المتأثرة بعد أي إصلاح أو تعديل متطلب.')
h('8.2 ملف قياس الأداء',2)
p('بيانات الحساب: 1000 مهمة و100 موعد و100 كتاب و50 مادة. الاتصال مضبوط على 10 Mbps وزمن شبكة ذهاب وإياب 100 ms. تُنفذ 30 محاولة متسلسلة لكل مقياس في متصفح سطح مكتب مستقر دون تبويبات حمل إضافية؛ يُسجل الجهاز وإصدار المتصفح في الدليل. يبدأ اختبار التحميل بجلسة صالحة، مع تعطيل ذاكرة HTTP المؤقتة وإعادة تحميل كاملة. زمن Google أو إيصال بريد الاستعادة خارج قياس تحميل اللوحة، لكنه داخل اختبارات نجاح التدفق.')
p('بداية تحميل اللوحة هي بدء الانتقال إلى مسارها، ونهايته ظهور بياناتها واستجابة مداخل التفاعل. بداية الحفظ ضغط الزر ونهايته رسالة تأكيد الخادم. يُحتسب الفشل إخفاقًا، وتستخدم الرتبة 29 من أزمنة 30 محاولة معيارًا لتحقيق 95% دون حذف المحاولات البطيئة. تُكرر القياسات بعد تغيير مؤثر في الأداء.')
h('8.3 سيناريوهات القبول',2)
for id,title,setup,steps,expected in TESTS:
    p(id+'  '+title,True,11,after=3,keep=True)
    p('الإعداد: '+setup,after=3,keep=True)
    p('الإجراء: '+steps,after=3,keep=True)
    p('النتيجة المتوقعة: '+expected,after=9)
h('8.4 سجل تنفيذ الاختبارات',2)
p('اجتازت المعاينة فحوصًا محلية محدودة وفق S13. واجتازت اختبارات Firebase الآلية المحددة في S15 على المحاكي؛ لا تعادل تنفيذ سيناريوهات TC كاملة. لا توجد نتيجة قبول للخدمة المنشورة أو نقل البيانات الفعلية.')
tbl(['السيناريو','النسخة والبيئة','النتيجة الفعلية والدليل','الحالة'],[('TC15','Chrome محلي؛ 360 و1440؛ العربية والإنجليزية','الأقسام والتصفية والعزل وحظر التخزين؛ S13','اجتاز محليًا'),('أجزاء TC16 وTC17 وTC23','محاكي demo-growspace؛ S15','عشرة اختبارات ملكية ومدخلات ومعاملات ومسودات','اجتاز جزئيًا'),('بقية TC وTC24','بيئة فعلية ونقل','لا نجاح مستنتج من فحص المحاكي','لم يُنفذ كاملًا')],[1.2,1.7,3,1.2])

h('9 مصفوفة تتبع المتطلبات',new=True)
needs=[('N01','الوصول الآمن إلى حساب شخصي'),('N02','تخصيص الاسم والهدف'),('N03','تنظيم المواد والمهام'),('N04','تنظيم المحاضرات والاختبارات'),('N05','معرفة أولويات اليوم والتقدم'),('N06','استخدام تركيز مبسط'),('N07','متابعة القراءة اختيارياً'),('N08','واجهة مفهومة ومتوافقة وقابلة للتحقق'),('N09','التعرف على اللوحة دون حساب أو حفظ'),('N10','حفظ موثوق وخصوصية')]
tbl(['الحاجة','الوصف'],needs,[1,6.1])
p('تربط الصفوف التالية كل متطلب بحاجته وحالة استخدامه وسيناريو التحقق. معايير القبول التفصيلية موجودة في سجل المتطلبات، والاختبارات المذكورة هنا تشملها جميعًا. IF واجهات مشتركة تدعم عدة حالات استخدام.')
interface_trace = {'IF-001':('N08','UC11'),'IF-002':('N10','مشترك للحساب'),'IF-003':('N01','UC02'),'IF-004':('N09، N10','UC12؛ مشترك للحساب')}
for id,title,shall,ac,src,tc in INTERFACES:
    need, uc = interface_trace[id]
    requirements.append(dict(id=id,need=need,uc=uc,tc=tc,source=src,decision='',priority='P1'))
tbl(['المتطلب','الحاجة','حالة الاستخدام','التحقق'],[(r['id'],r['need'],r['uc'],r['tc']) for r in requirements],[1.65,1.15,2.6,1.7])

h('10 حالة التنفيذ الحالية',new=True)
p('تستند حالة التنفيذ إلى قراءة 10 سبتمبر 2026 للمرجع 87675a6 وتعديلات مساحة العمل. نُقل كود الحساب والبيانات إلى Firebase واجتاز فحص الأنواع والبناء واختبارات المحاكي المحددة في S15. لم يُتحقق من نشر القواعد أو نقل الحسابات والبيانات الفعلية؛ لا تدل هذه النتائج على جاهزية الإطلاق.')
for area,current,target,ids in GAPS:
    h(area,2);p('الموجود في الملفات: '+current)
    p('الفجوة أمام المتطلبات المستهدفة: '+target)
    p('المرجع: '+ids,size=9.5)
p('تحديث مصدري: Overview.tsx مرتبط حاليًا بلوحة الحساب. المعاينة مستقلة عنه في features/preview ولا تستورد عميل Firebase أو بيانات الحساب.')

h('11 سجل القرارات والمصادر',new=True)
h('11.1 قرارات النطاق المعتمدة',2)
p('اعتمد مالك المشروع نسخة الويب المستهدفة للتوثيق والتطوير معًا، والعربية مع مصطلحات إنجليزية، والتسليم Word وPDF، والاسترشاد بـ 29148:2018، وإكمال الوظائف الحالية مع Google وتأجيل قائمة الانتظار. هذه القرارات محددة في S01.')
p('اعتمد كذلك Firebase وخيار نقل الحسابات والبيانات الموجودة وفق S14 وS16. قرار الخدمة لا يعتمد تلقائيًا بقية مقترحات قواعد المنتج أو معايير الجودة.')
h('11.2 قواعد المنتج المفصلة',2)
p('حالة الحزمة D01 إلى D08: '+('معتمدة من مالك المشروع في المحادثة بتاريخ 6 سبتمبر 2026.' if APPROVED else 'قيد المراجعة المجمعة؛ اعتمد المستخدم توجيه المسودات S11 في D04 واستبدال التجربة بالمعاينة S12 في D06، دون اعتبار ذلك اعتمادًا لبقية التفاصيل.'))
for id,title,rule,refs in DECISIONS:
    p(id+'  '+title,True,11,after=3,keep=True);p(rule,keep=True);p('المتطلبات المتأثرة: '+refs,size=10,after=8)
h('11.3 سجل المصادر',2)
p('المسارات أدناه نسبية إلى جذر مستودع GrowSpace لتظل قابلة للنقل بين أعضاء الفريق. المراجع المعيارية قُرئت في 6 سبتمبر 2026، والمعاينة في 8 سبتمبر، ومراجع Firebase في 9 سبتمبر وفق سجل كل مصدر. لا يتضمن السجل أسرار البيئة أو بيانات حسابات حقيقية.')
for id,kind,path,purpose in SOURCES:
    p(id+'  '+kind,True,11,after=3,keep=True)
    p(path,size=10,after=3,keep=True)
    p('الاستخدام: '+purpose,after=8)
h('11.4 اعتماد المستند',2)
p(('النطاق والحزمة التفصيلية معتمدان. تبقى أدلة التحقق التشغيلي مطلوبة قبل قبول التطبيق للإطلاق؛ لا توجد نتيجة نجاح للمنتج مستنتجة من هذه الوثيقة.' if APPROVED else 'النطاق والمسودات والمعاينة وقرارا Firebase ونقل البيانات معتمدة؛ اعتماد بقية الحزمة التفصيلية معلق. بعد حسمها تُحدث المتطلبات والقبول والتتبع معًا ويصدر الإصدار 1.0. حتى ذلك الحين يستخدم هذا الإصدار للمراجعة، وليس مرجع تنفيذ نهائيًا.'),bold=True)

# Footer contents are a template text slot; preserve paragraph arrangement.
for section in doc.sections:
    for footer in (section.footer, section.first_page_footer,section.even_page_footer):
        for para in footer.paragraphs:
            clean_p(para);rtl(para,False);para.alignment=WD_ALIGN_PARAGRAPH.CENTER
            text_runs(para,'GrowSpace | SRS '+VERSION+' | ',False,8,MUTED)
            field(para,' PAGE ')

settings=doc.settings.element
u=settings.find(qn('w:updateFields'))
if u is None:u=OxmlElement('w:updateFields');settings.append(u)
u.set(qn('w:val'),'true')

raw=BASE/'authored.docx';doc.save(raw)
target=OUT/'GrowSpace_SRS_AR.docx'
# Keep opaque and source style parts byte-for-byte; replace only authored slots.
allowed={'word/document.xml','word/_rels/document.xml.rels','[Content_Types].xml','docProps/core.xml','word/settings.xml'}
with ZipFile(REF) as orig,ZipFile(raw) as built,ZipFile(target,'w',ZIP_DEFLATED) as dest:
    for name in built.namelist():
        if name.startswith('word/footer') and name.endswith('.xml'):allowed.add(name)
        if name not in orig.namelist():allowed.add(name)
        data=built.read(name) if name in allowed or name not in orig.namelist() else orig.read(name)
        if name=='word/footnotes.xml':
            tree=etree.fromstring(data)
            for el in tree.findall('.//'+qn('w:t')):el.text=''
            data=etree.tostring(tree,xml_declaration=True,encoding='UTF-8',standalone=True);allowed.add(name)
        dest.writestr(name,data)

req_ids=[r['id'] for r in requirements]
assert len(req_ids)==len(set(req_ids))
test_ids={x[0] for x in TESTS}
for r in requirements:
    assert all(t in test_ids for t in re.findall(r'TC\d+',r['tc'])),r
with ZipFile(REF) as a,ZipFile(target) as b:
    changed=[n for n in a.namelist() if n not in allowed and a.read(n)!=b.read(n)]
    assert not changed,changed
    assert etree.fromstring(a.read('word/document.xml')).find('.//'+qn('w:sectPr')).get(qn('w:rsidR'))==etree.fromstring(b.read('word/document.xml')).find('.//'+qn('w:sectPr')).get(qn('w:rsidR'))

(BASE/'requirements.json').write_text(json.dumps(requirements,ensure_ascii=False,indent=2),encoding='utf8')
(BASE/'build-report.json').write_text(json.dumps({'version':VERSION,'status':STATUS,'requirements':len(requirements),'functional':sum(len(g[-1]) for g in GROUPS),'nonfunctional':len(NFR),'interfaces':len(INTERFACES),'usecases':len(USECASES),'tests':len(TESTS),'figures':3,'reference_sha256':sha256(REF.read_bytes()).hexdigest(),'preserve_only_changed':changed},ensure_ascii=False,indent=2),encoding='utf8')
print(target)
print((BASE/'build-report.json').read_text(encoding='utf8'))
