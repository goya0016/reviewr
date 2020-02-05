const app = {
    reviews: [],
    KEY: null,
    imgURI:null,
    permFolder: null,
    permFile: null,
    delid:null,
    init: () => {
      app.KEY = "Nipun";
      // app.getReviews();
      app.timer();
    },
    timer:()=>{
      setTimeout(function(){
        app.getReviews();
        app.addListeners();
        app.directory();
        },2000)
    },
    getReviews: () => {
      if (localStorage.getItem(app.KEY)) {
        let str = localStorage.getItem(app.KEY);
        app.reviews = JSON.parse(str);
      }
      app.insertdata();
      document.querySelector('.review-list').addEventListener('click',app.imgdetail);
    },
    addListeners: () => {
      document.getElementById("btnAdd").addEventListener("click", app.nav);
      document
        .getElementById("btnDetailsBack")
        .addEventListener("click", app.nav);
      document.getElementById("btnAddBack").addEventListener("click", app.nav);
      document.getElementById('btnDelete').addEventListener("click",app.deletefile);
    },
    nav: ev => {
      window.scrollTo(0,0);
      let btn = ev.target;
      let target = btn.getAttribute("data-target");
      document.getElementById("btnTakePhoto").addEventListener('click',app.new);
      document.getElementById('add').classList.remove('hasPhoto');
      document.querySelector(".page.active").classList.remove("active");
      document.getElementById(target).classList.add("active");
    },
    new:()=>{
        let opts = {
            quality: 80,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            mediaType: Camera.MediaType.PICTURE,
            encodingType: Camera.EncodingType.JPEG,
            cameraDirection: Camera.Direction.BACK,
            targetWidth: 300,
            targetHeight: 400
        };
        
        navigator.camera.getPicture(app.success, app.fail, opts);
    },
    success: function(path){
       document.getElementById('add').classList.toggle('hasPhoto');
        document.getElementById('imgAdd').src = path;
        app.imgURI=path
        document.getElementById("btnSave").addEventListener("click",app.savefile);
    },
    fail: function(){
      console.log("falied to execute camera.")
    },
    directory:()=>{
      let path= cordova.file.dataDirectory;
      resolveLocalFileSystemURL(path, app.gotpath, app.fail);
    },
    gotpath:(directory)=>{
      directory.getDirectory("images", { create: true }, 
        permDir => {
          app.permFolder = permDir;
          }, app.fail);
},
    savefile:function(){
      let fileName = Date.now().toString() + ".jpg";
  
      resolveLocalFileSystemURL(
        app.imgURI,
        entry => {
          entry.copyTo(
            app.permFolder,
            fileName,
            permFile => {
              let title= document.getElementById('name').value;
              let rating= document.getElementById('rating').value;
              if(title==""||rating=="" ){
                alert("One of the required field is blank");
                ev.stopImmediatePropagation();
              }else{

                let path = permFile.nativeURL;
                app.permFile = permFile;
                
                app.reviews.push({
                    id:Date.now(),
                    title:title,
                    rating:rating,
                    src: permFile.nativeURL
                })
                localStorage.setItem(app.KEY, JSON.stringify(app.reviews));
                app.navigation();
              }
            },
            
            fileErr => {
              console.warn("Copy error", fileErr);
            }
          );
        },
        err => {
          console.error(err);
        }
      );
    },

    insertdata: () => {
      window.scrollTo(0,0);
      let ul = document.querySelector(".review-list");
      if(app.reviews.length===0){
        ul.innerHTML="You Don't have any reviews saved. Please click the add button above to start a new review. ";
      }else{
        ul.innerHTML="";
        app.reviews.forEach(element=>{
          let li = document.createElement('li');
          let title= document.createElement('p');
          let rating= document.createElement('span');
          let img= document.createElement('img');
          // let br = document.createElement('br'); 
          
          li.setAttribute('data-target-id',element.id);
          title.textContent="Title: "+element.title;
          rating.textContent= "Rating: " + element.rating + "/5";
          img.setAttribute('src',element.src);
          img.setAttribute('alt','image');
          img.setAttribute('class','imageR');
          
          li.appendChild(img);
          img.insertAdjacentElement('afterend',title);
          title.appendChild(rating);
          // rating.insertAdjacentElement("beforebegin",br);
          ul.appendChild(li);
        })
      }
      
    },
    navigation:()=>{
      window.scrollTo(0,0);
      document.getElementById('add').classList.toggle('active');
      document.getElementById('home').classList.toggle('active');
      document.getElementById('add').classList.toggle('hasPhoto');
      document.getElementById('name').value="";
      document.getElementById('rating').value="";
      app.insertdata();
    },
    imgdetail:(ev)=>{
      window.scrollTo(0,0);
      let clicked=ev.target;
      let item = clicked.closest('[data-target-id]');
      let id = parseInt( item.getAttribute('data-target-id') );
      let gotreview = app.reviews.find( element => element.id === id);
      let span= document.createElement('span');
      // span.setAttribute('class','span');
        app.delid=gotreview.id;
        document.getElementById("imgDetails").src= gotreview.src;
        document.querySelector("figcaption").textContent= gotreview.title;
        span.textContent= gotreview.rating+"/5";
        document.querySelector("figcaption").insertAdjacentElement('beforeend',span);
        
        document.querySelector('.active').classList.toggle('active');
        document.getElementById('details').classList.toggle('active');
    },
    deletefile:()=>{
      app.reviews.forEach(element=>{
        if(app.delid==element.id){
         let index= app.reviews.indexOf(element);
         app.reviews.splice(index,1);
         app.insertdata();
         localStorage.setItem(app.KEY, JSON.stringify(app.reviews))
          document.getElementById('details').classList.toggle('active');
          document.getElementById('home').classList.toggle('active');
        }
      })
    }
  };
  const ready = "cordova" in window ? "deviceready" : "DOMContentLoaded";
  document.addEventListener(ready, app.init);