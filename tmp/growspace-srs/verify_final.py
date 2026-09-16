from pathlib import Path
from zipfile import ZipFile
from hashlib import sha256
from lxml import etree
import json, re
import pdfplumber

base=Path(__file__).parent
out=base.parents[1]/'output'/'documents'
reqs=json.loads((base/'requirements.json').read_text(encoding='utf8'))
with ZipFile(out/'GrowSpace_SRS_AR.docx') as z:
    root=etree.fromstring(z.read('word/document.xml'))
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    doc_text=''.join(root.xpath('//w:t/text()',namespaces=ns))
    drawings=len(root.xpath('//w:drawing',namespaces=ns))
    section=root.find('.//w:sectPr',ns)
    geometry={etree.QName(c).localname:dict(c.attrib) for c in section if etree.QName(c).localname in ('pgSz','pgMar')}
with pdfplumber.open(out/'GrowSpace_SRS_AR.pdf') as pdf:
    pdf_text='\n'.join(p.extract_text() or '' for p in pdf.pages)
    missing_pdf=[r['id'] for r in reqs if r['id'] not in pdf_text]
    missing_doc=[r['id'] for r in reqs if r['id'] not in doc_text]
    out_of_bounds=[i+1 for i,p in enumerate(pdf.pages) if any(c['x0'] < 35 or c['x1'] > 577 for c in p.chars)]
    assert not missing_pdf and not missing_doc and not out_of_bounds
    assert drawings==3 and len(pdf.pages)==30
    assert all('TC'+str(i).zfill(2) in pdf_text for i in range(1,24))
    assert all('UC'+str(i).zfill(2) in pdf_text for i in range(1,13))
    renders=sorted((base/'render-preview-final').glob('page-*.png'))
    assert len(renders)==30
    assert all(s in doc_text for s in ('FR-DAT-005','S11','S12','S13','0.10')) and len(reqs)==56
    report={'pages':len(pdf.pages),'requirements_present_in_both':len(reqs),'diagrams':drawings,'all_test_and_usecase_ids_present':True,'out_of_bounds_pages':out_of_bounds,'visually_reviewed_pages':list(range(1,31)),'render_review':'Native Word PDF export; pages 5-11 pixel-identical to inspected preceding render; all other final pages inspected directly','approval':'S11 session drafts and S12 read-only preview approved; remainder of detailed decision bundle pending','geometry':geometry,'artifacts':{p.name:sha256(p.read_bytes()).hexdigest() for p in out.glob('GrowSpace_SRS_AR.*')}}
    (base/'final-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({k:v for k,v in report.items() if k not in ('geometry','artifacts')},ensure_ascii=False,indent=2))
