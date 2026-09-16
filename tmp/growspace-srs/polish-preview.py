from pathlib import Path
p=Path('tmp/growspace-srs/build.py');s=p.read_text(encoding='utf8')
s=s.replace("arrow(d,[(1030,675),(1030,900)],'Preview examples'", "arrow(d,[(1030,900),(1030,675)],'Preview examples'")
s='\n'.join(line for line in s.splitlines() if not line.startswith("p('تغيّر معنى FR-DEM-001"))+'\n'
s=s.replace('خروج ميزة من النطاق لا يعني حذف كودها في هذه المهمة. ', 'استُبدلت التجربة القابلة للتعديل بالمعاينة وفق S12. ')
p.write_text(s,encoding='utf8')
p=Path('tmp/growspace-srs/content.py');s=p.read_text(encoding='utf8').replace('يلغي الكتابة والحفظ ومخزن التجربة؛ يسمح بالتنقل والعرض على أمثلة ثابتة دون بيانات مستخدم.', 'يلغي الكتابة والحفظ ومخزن التجربة؛ يسمح بالتنقل والعرض على أمثلة ثابتة دون بيانات مستخدم. حُفظت معرفات FR-DEM-001 إلى FR-DEM-003 بمعناها المحدّث للتتبع.');p.write_text(s,encoding='utf8')
