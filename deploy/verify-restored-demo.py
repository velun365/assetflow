import urllib.request,urllib.error,http.cookiejar,json,pathlib,hashlib,time
base='http://localhost'
def session(): return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def req(o,path,data=None,headers=None,method=None):
 with o.open(urllib.request.Request(base+path,data=data,headers=headers or {},method=method),timeout=30) as r: return r.read()
def login(name,password):
 o=session(); c=json.loads(req(o,'/api/auth/csrf'))
 data=req(o,'/api/auth/login',json.dumps(dict(loginId=name,password=password)).encode(),{'Content-Type':'application/json',c['headerName']:c['token']})
 return o,json.loads(req(o,'/api/auth/me'))
for attempt in range(20):
 try: req(session(),'/api/auth/csrf');break
 except Exception: time.sleep(2)
for name,password,role in [('admin','admin1234','ADMIN'),('manager','test1234','MANAGER')]+[(f'user{i:02}','test1234','USER') for i in range(1,17) if i not in (6,14)]:
 o,me=login(name,password);assert me['role']==role and me['loginId']==name,me
 print('LOGIN_OK',name,role)
for name in ['user06','user14']:
 try: login(name,'test1234'); raise RuntimeError('Suspended login unexpectedly allowed')
 except urllib.error.HTTPError as e:
  body=e.read().decode(); assert e.code in (400,401,403) and '정지' in body,body
  print('SUSPENDED_REJECTED',name,e.code)
o,_=login('admin','admin1234')
for f in sorted(pathlib.Path('/home/ec2-user/assetflow/restore-images').iterdir()):
 aid=int(f.stem);c=json.loads(req(o,'/api/auth/csrf'));boundary='AssetflowRestoreMultipart20261006';blob=f.read_bytes()
 mime='image/webp' if f.suffix=='.webp' else 'image/jpeg'
 body=(f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="{f.name}"\r\nContent-Type: {mime}\r\n\r\n').encode()+blob+f'\r\n--{boundary}--\r\n'.encode()
 req(o,f'/api/assets/{aid}/image',body,{'Content-Type':f'multipart/form-data; boundary={boundary}',c['headerName']:c['token']},'PATCH')
 detail=json.loads(req(o,f'/api/assets/{aid}'))
 print('ASSET_DETAIL',aid,json.dumps(detail,ensure_ascii=False))
 path=detail.get('imagePath')
 if path:
  assert hashlib.sha256(req(o,path)).digest()==hashlib.sha256(blob).digest()
  print('IMAGE_VERIFIED',aid,path)
print('RESTORE_VERIFICATION_COMPLETE')
