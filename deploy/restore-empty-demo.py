import json,subprocess,urllib.parse,os,pathlib
root='/home/ec2-user/assetflow'
e=json.loads(subprocess.check_output(['docker','compose','config','--format','json'],cwd=root))['services']['backend']['environment']
u=urllib.parse.urlparse(e['DB_URL'].removeprefix('jdbc:'))
env=os.environ.copy();env['MYSQL_PWD']=e['DB_PASSWORD']
cmd=['docker','run','--rm','-i','--network','host','--env','MYSQL_PWD','mysql:8.4','mysql','--ssl-mode=REQUIRED','--default-character-set=utf8mb4','-h',u.hostname,'-P',str(u.port or 3306),'-u',e['DB_USERNAME'],'-N','-B','assetflow']
def sql(s):
 r=subprocess.run(cmd,input=s,text=True,capture_output=True,env=env)
 if r.returncode: raise RuntimeError(r.stderr.replace(e['DB_PASSWORD'],'[REDACTED]'))
 return r.stdout
subprocess.run(['docker','compose','stop','backend'],cwd=root,check=True)
try:
 tables=['member','department','category','asset','asset_item','loan','reservation']
 counts=sql(' UNION ALL '.join("SELECT '"+t+"',COUNT(*) FROM "+t for t in tables)+';')
 print('BEFORE\n'+counts)
 if any(int(line.split('\t')[1]) for line in counts.splitlines()): raise RuntimeError('Database is not empty; restoration refused')
 sql(pathlib.Path(root+'/deploy/restore-historical-demo.sql').read_text(encoding='utf-8'))
 print('AFTER\n'+sql(' UNION ALL '.join("SELECT '"+t+"',COUNT(*) FROM "+t for t in tables)+';'))
 print(sql('SELECT role,COUNT(*) FROM member GROUP BY role;'))
finally: subprocess.run(['docker','compose','up','-d','backend'],cwd=root,check=True)
