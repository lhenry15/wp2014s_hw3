(function(){

Parse.initialize("ngiLA28WZULctb2co05xVhdfNwrafb09zzjyeagN","iaqupcNjcjwapUk57lVVoPkdzfVR0PHsF7Pp5zkJ");

var e={};

["loginView","evaluationView","updateSuccessView"].forEach(

function(t){
		templateCode = document.getElementById(t).text;
		e[t] = doT.template(templateCode);
		});
//檢查使用者權限
var t={
	loginRequiredView:function(e){
			return function(){
				var t=Parse.User.current();
				if(t){
					e();
				}else{
					window.location.hash="login/"+window.location.hash;
				}
			};
		}
	};
//功能都在這兒
var n={
	//更改nav_bar的狀態
	navbar:function(){
			var user=Parse.User.current();
			if(user){
				document.getElementById("loginButton").style.display="none";
				document.getElementById("logoutButton").style.display="block";
				document.getElementById("evaluationButton").style.display="block";
			}else{
				document.getElementById("loginButton").style.display="block";
				document.getElementById("logoutButton").style.display="none";
				document.getElementById("evaluationButton").style.display="none";
				}
			document.getElementById("logoutButton").addEventListener("click",function(){
				Parse.User.logOut();
				n.navbar();				
				})				
		},
		//控制評分頁面
		evaluationView:t.loginRequiredView(function(){		
			var t=Parse.Object.extend("Evaluation"); //開一個新的物件叫做Evaluation
			var n=Parse.User.current(); //目前使用者身份
			var r=new Parse.ACL; //開一個新的access control list 去管理可使用"Evaluation"的權限名單
			r.setPublicReadAccess(false);
			r.setPublicWriteAccess(false);
			r.setReadAccess(n,true);
			r.setWriteAccess(n,true);
			var i=new Parse.Query(t);
			i.equalTo("user",n); //做pointer將user那一欄指到現在的currentUser
			i.first({    
				success:function(i){
					window.EVAL=i;	
					if(i===undefined){
						var s=TAHelp.getMemberlistOf(n.get("username")).filter(function(e){
							return e.StudentId!==n.get("username")?true:false
							}).map(function(e){
								e.scores=["0","0","0","0"];
								return e
								})
					}else{
						var s=i.toJSON().evaluations	
					}
					document.getElementById("content").innerHTML=e.evaluationView(s);
					document.getElementById("evaluationForm-submit").value=i===undefined?"送出表單":"修改表單";
					document.getElementById("evaluationForm").addEventListener("submit",function(){
						for(var o=0;o<s.length;o++){
							for(var u=0;u<s[o].scores.length;u++){
								var a=document.getElementById("stu"+s[o].StudentId+"-q"+u);
								var f=a.options[a.selectedIndex].value;s[o].scores[u]=f;
								}
							}
						if(i===undefined){
							i=new t;
							i.set("user",n);
							i.setACL(r);
						}
						console.log(s);
						i.set("evaluations",s);
						i.save(null,{
							success:function(){
								document.getElementById("content").innerHTML=e.updateSuccessView()
								},
							error:function(){					
								}
							})
						},false)
				},
				error:function(e,t){							
				}
			})
		//控制登入畫面
		}),loginView:function(t){
			//判斷是否在修課名單內(用ta.help判斷) 			
			var r=function(e){
				var t=document.getElementById(e).value;
				return TAHelp.getMemberlistOf(t)===false?false:true
				};
			//判斷是否在修課名單內，若在修課名單內則不印警告標示，若不在則印出警告標語	
			var i=function(e,t,n){
				if(!t()){
					document.getElementById(e).innerHTML=n;
					document.getElementById(e).style.display="block"
					}else{
						document.getElementById(e).style.display="none"
					}
				};
			//更改navigation_bar的狀態	
			var s=function(){
				n.navbar();
				window.location.hash=t?t:""
				};
			//判斷倆次密碼是否相同	
			var o=function(){
				var e=document.getElementById("form-signup-password");
				var t=document.getElementById("form-signup-password1");
				var n=e.value===t.value?true:false;
				i("form-signup-message",function(){
					return n
					},"Passwords don't match.");return n
				};
			
			document.getElementById("content").innerHTML=e.loginView(); //印出login畫面的版型
			//判斷是否為修課人員
			document.getElementById("form-signin-student-id").addEventListener("keyup",function(){
				i("form-signin-message",function(){return r("form-signin-student-id")},"The student is not one of the class students.")
				});
			document.getElementById("form-signin").addEventListener("submit",function(){
				if(!r("form-signin-student-id")){
					alert("The student is not one of the class students.");return false
					}
				//登入
				Parse.User.logIn(document.getElementById("form-signin-student-id").value,document.getElementById("form-signin-password").value,{
					success:function(e){ 
						s() //登入成功則更改nav_bar的狀態，並導向另一個頁面
						},
					error:function(e,t){ //失敗則顯示錯誤訊息
							i("form-signin-message",function(){
								return false 
								}
							,"Invaild username or password.")
							}
					})
			},false);
			//判斷是否為修課人員
			document.getElementById("form-signup-student-id").addEventListener("keyup",function(){
				i("form-signup-message",function(){
					return r("form-signup-student-id")
				},"The student is not one of the class students.")
			});
			document.getElementById("form-signup-password1").addEventListener("keyup",o);
			document.getElementById("form-signup").addEventListener("submit",function(){
				if(!r("form-signup-student-id")){
					alert("The student is not one of the class students.");return false
					}
					var e=o();					
					//註冊新會員
					if(!e){     //判斷倆個密碼是否相同   
						return false
						}
						var t=new Parse.User;
						t.set("username",document.getElementById("form-signup-student-id").value);
						t.set("password",document.getElementById("form-signup-password").value);
						t.set("email",document.getElementById("form-signup-email").value);
						//新建帳號完成後立即登入	          
						t.signUp(null,{
							success:function(e){
								s()
								},error:function(e,t){
									i("form-signup-message",function(){
										return false
										},t.message)
								}
						})
			},false)
		}
	};
var r=Parse.Router.extend({
	routes:{
		"":"indexView",
		"peer-evaluation/":"evaluationView",
		"login/*redirect":"loginView"
		},
		indexView:n.evaluationView,
		evaluationView:n.evaluationView,
		loginView:n.loginView
	});
this.Router=new r;
Parse.history.start();
n.navbar()})()