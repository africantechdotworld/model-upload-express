



// console.log("scene_file", scene_file)
// console.log("sound_file", sound_file)

const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id')
console.log("id", id);
const background_color = "#" + urlParams.get('backgroundColor');
console.log("backgound_color", background_color)
const AUTOPLAY = urlParams.get('autoplay') == "true";

const INTENSITY = parseFloat(urlParams.get('intensity'));

const PLATFORM_VISIBLE = urlParams.get('platform') == "true";

if(AUTOPLAY)
{
  document.getElementById("play_button").style.display = "none";
}

const LOOP_SCENE_SOUND = urlParams.get("loop_scene_audio") == "true";
document.getElementById("audio").loop = LOOP_SCENE_SOUND;

const INDIVIDUAL_ANIMATION_PLAY_ENABLED = urlParams.get("individual_animation_playbuttons") == "true";



const IS_MOBILE = mobileAndTabletCheck();

const scene = new THREE.Scene();

var clock = new THREE.Clock();
var loaded_gltf, mixer;
var actions = [];


var IS_PLAYING = false;
 
const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );
gridHelper.visible = PLATFORM_VISIBLE;

const renderer = new THREE.WebGLRenderer({antialias: true});

scene.background = new THREE.Color( background_color );


const models = [];


const container = document.getElementById("scene-container");
renderer.setSize( container.offsetWidth, container.offsetHeight );
container.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 75, container.offsetWidth / container.offsetHeight, 0.1, 1000 );

camera.position.set(0, 10, 5)

const controls = new THREE.OrbitControls(camera, renderer.domElement);


var light = new THREE.AmbientLight();
scene.add(light);


const directionalLight = new THREE.DirectionalLight( 0xffffff, INTENSITY );
scene.add( directionalLight );
directionalLight.position.y = 10;

const directionalLight2 = new THREE.DirectionalLight( 0xffffff, INTENSITY );
scene.add( directionalLight2);
directionalLight2.position.z = 5;
directionalLight2.position.y = 5;

const directionalLight3 = new THREE.DirectionalLight( 0xffffff, INTENSITY);
scene.add( directionalLight3);
directionalLight3.position.z = -5;
directionalLight3.position.y = 5;


// const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
// scene.add( directionalLight );
//directionalLight.position.set(0, 0, -10);


window.addEventListener("resize", ()=>
{

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.offsetWidth, container.offsetHeight );

})






// const loader = new THREE.GLTFLoader()
// loader.load("/" + id+"/scene.gltf", (gltf)=>
// {
//   loaded_gltf = gltf.scene;
//   loaded_gltf.animations.push(...gltf.animations)
//   scene.add(gltf.scene);

//   mixer = new THREE.AnimationMixer(loaded_gltf);
//   loaded_gltf.animations.forEach(animation => {
//     var action = mixer.clipAction( animation );
//     actions.push(action)
//   });

//   console.log("Loaded gltf", gltf)

//   const spinner = document.getElementById("spinner");
//   spinner.style.visibility = "hidden";

//   //fitCameraToObject(camera, gltf.scene, 1.25, controls )
//   fitCameraToObject(camera, gltf.scene, controls);
//   fetch_cubemap();
//   fetch_image_background();
//   getSoundFile();
// })





const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function handleOnclickIframe (event) {


  pointer.x = ( event.clientX / container.offsetWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / container.offsetHeight ) * 2 + 1;

  // update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );



  var models_3d = [];
  models.forEach((model)=>{
    models_3d.push(model.model)
  })
	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( models_3d, true);

  if(intersects.length == 0)
  {
    return;
  }

  console.log("intersects", intersects)


    var selected_model_object;
    models.forEach((model_object)=>
    {
      if(model_object.model == intersects[0].object)
      {
        selected_model_object = model_object;
      }
      model_object.model.traverse((child)=>
      {
        if(child == intersects[0].object)
        {
          selected_model_object = model_object;
        }
      })

    })

    console.log("selected_model_object found", selected_model_object)

    if(selected_model_object)
    {
        console.log("selected_model_object.iframe.url", selected_model_object.iframe.url)
        if(selected_model_object.iframe.url === "")
        {
          return;
        }
        if(selected_model_object.iframe.iframe_openNewWindow)
        {
          const newTabUrl = "iframeNewWindow.html?sound=" + encodeURI("/" + id + "/" + selected_model_object.iframe.sound_file_name) +"&loop_audio=" + selected_model_object.iframe.loop_audio 
          + "&url=" + encodeURI(selected_model_object.iframe.url);
          window.open(newTabUrl);
          return;
        }


        const onclick_iframe_container = document.createElement("div");
        onclick_iframe_container.className = "onclick_iframe_container";
        const onclick_iframe = document.createElement("iframe");
        onclick_iframe.className = "onclick_iframe";
        onclick_iframe.src = selected_model_object.iframe.url;
        onclick_iframe_container.appendChild(onclick_iframe);
        onclick_iframe_container.style.width = (selected_model_object.iframe.width ? selected_model_object.iframe.width: DEFAULT_IFRAME_WIDTH) + "px";
        onclick_iframe_container.style.height = (selected_model_object.iframe.height ? selected_model_object.iframe.height: DEFAULT_IFRAME_HEIGHT) + "px";
        onclick_iframe_container.style.left = (selected_model_object.iframe.posLeft ? selected_model_object.iframe.posLeft : 0) + "px";
        onclick_iframe_container.style.top = (selected_model_object.iframe.posTop ? selected_model_object.iframe.posTop : 0) + "px";
        onclick_iframe_container.style.display = "block";

        document.body.appendChild(onclick_iframe_container);


        const audio = document.createElement("audio");
        audio.className = "iframe_audio"
        audio.style.display = "none";
        const src = document.createElement("source");
        src.className = "iframe-audio-src";
        audio.appendChild(src);
        onclick_iframe_container.appendChild(audio);

        const url = "/" + id + "/" + selected_model_object.iframe.sound_file_name;
        if(url)
        {
          //alert("Play")
          src.src = url;
          audio.load();
          audio.play();
          audio.loop = selected_model_object.iframe.loop_audio;

          //pause main audio
          document.getElementById("audio").pause();
        }

        var close_onclick_iframe_btn = document.createElement("button");
        close_onclick_iframe_btn.className = "close_onclick_iframe_button";
        close_onclick_iframe_btn.innerText = "X";
        onclick_iframe_container.appendChild(close_onclick_iframe_btn);
        close_onclick_iframe_btn.addEventListener("click", (e)=>
        {
          audio.pause();
          audio.currentTime = 0;
          document.body.removeChild(onclick_iframe_container);


          //resume main audio if no iframes are opened
          if(document.querySelector(".onclick_iframe_container") == null)
          {
            document.getElementById("audio").play();
          }
          
        })

        
    }


}



window.addEventListener("dblclick", (event) => {
  handleOnclickIframe(event);
});

if(IS_MOBILE)
{
  window.addEventListener("click", (event) => {
    handleOnclickIframe(event);
  });
}







function applyFileTransform(model, file)
{
  model.position.x = file.positionX;
  model.position.y = file.positionY;
  model.position.z = file.positionZ;

  model.scale.x = file.scale;
  model.scale.y = file.scale;
  model.scale.z = file.scale;

  model.rotation.x = file.rotationX;
  model.rotation.y = file.rotationY;
  model.rotation.z = file.rotationZ;



  
  camera.position.x = file.cameraPosX;
  camera.position.y = file.cameraPosY;
  camera.position.z = file.cameraPosZ;

  camera.rotation.x = file.cameraRotX;
  camera.rotation.y = file.cameraRotY;
  camera.rotation.z = file.cameraRotZ;

  console.log("camera.position", camera.position);
  console.log("camera", camera)

  controls.update();

  controls.target.x = file.controlsTargetX;
  controls.target.y = file.controlsTargetY;
  controls.target.z = file.controlsTargetZ;

  controls.update();
  


}




window.addEventListener("click", (event)=>
{

  if(!INDIVIDUAL_ANIMATION_PLAY_ENABLED)
  {
    return;
  }


  pointer.x = ( event.clientX / container.offsetWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / container.offsetHeight ) * 2 + 1;

  // update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );



  var sprites_3d = [];
  models.forEach((model)=>{
    if(model.play_button_sprite)
    {
      sprites_3d.push(model.play_button_sprite)
    }
  })
	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( sprites_3d, true);

  if(intersects.length == 0)
  {
    return;
  }


    var selected_model_object;
    models.forEach((model_object)=>
    {
      if(model_object.play_button_sprite !== null)
      {
      

        if(model_object.play_button_sprite == intersects[0].object)
        {
          selected_model_object = model_object;
        }
      }
    })
    if(selected_model_object)
    {
      if(selected_model_object.model.animations.length > 0)
      {
        selected_model_object.action.reset();
        selected_model_object.action.play();
        scene.remove(selected_model_object.play_button_sprite);
        selected_model_object.play_button_sprite.geometry.dispose();
        selected_model_object.play_button_sprite.material.dispose();
        selected_model_object.play_button_sprite = null;
      }
    }

});

function addPlayButton(model_object)
{

  if(model_object.model.animations.length == 0)
  {
    return;
  }
  const map = new THREE.TextureLoader().load( '/images/play.png' );
  const material = new THREE.MeshBasicMaterial( { map: map, opacity: 0.5} );
  
  //const geometry = new THREE.PlaneGeometry( 1, 1 );
  const geometry = new THREE.CircleGeometry( 5, 32 ); 
  const sprite = new THREE.Mesh( geometry, material );
  // sprite.material.color.setHex(0xFFFFFF)
  // sprite.material.neeedsUpdate = truel;
  scene.add( sprite );



  var bbox = new THREE.Box3().setFromObject(model_object.model);
  var size = new THREE.Vector3();
  bbox.getSize(size);
  const model_width = size.x;
  const model_height = size.y;
  const model_depth = size.z;

  var spritebbox = new THREE.Box3().setFromObject(sprite);
  var sprite_size = new THREE.Vector3(); 
  spritebbox.getSize(sprite_size);
  const sprite_width = sprite_size.x;
  const sprite_height = sprite_size.y;
  const sprite_depth = sprite_size.z;

  const width_ratio = model_width/sprite_width * 0.2;
  //const height_ratio = model_height/sprite_height;

  sprite.scale.set(width_ratio, width_ratio, 1);
  

  const center = new THREE.Vector3();
  bbox.getCenter(center)




  sprite.position.set(center.x,center.y, center.z + model_depth/2 + 0.01);
  model_object.play_button_sprite = sprite;


}

function loadModels (){

  fetch("/" + id + "/fileList.json", {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
    },
  })
   .then(response => response.json())
   .then((fileList) => {
      console.log("FileList", fileList);

      const manager = new THREE.LoadingManager();
      manager.onLoad = function ( ) {
        console.log( 'Loading complete!');
        const spinner = document.getElementById("spinner");
        spinner.style.visibility = "hidden";

        fetch_cubemap();
        fetch_image_background();
        getSoundFile();

        //fitCameraToObject(camera, scene, 1.25, controls )
      };

      fileList.forEach((file)=>
      {
        const extension = file.name.split('.').pop();
        if(extension == "glb")
        {
          const loader = new THREE.GLTFLoader(manager);
          const url = "/" + id + "/" + file.name;
          loader.load(url, (gltf) => {
            console.log("gltf added", gltf)
            var model = gltf.scene;
            model.animations.push(...gltf.animations)
            scene.add(model);
            applyFileTransform(model, file);


            const model_object = {model: model, iframe: {width: file.iframe_width, height: file.iframe_height, url: file.iframe_url, sound_file_name: file.iframe_sound_file_name,
              posLeft: file.iframe_posLeft, posTop: file.iframe_posTop, iframe_openNewWindow: file.iframe_openNewWindow, loop_audio: file.iframe_loop_audio},
              animation_timescale: file.animation_timescale, animation_loop: file.animation_loop};

            if(model.animations.length > 0)
            {
              var mixer = new THREE.AnimationMixer( model );
    
              model_object.mixer = mixer;
    
              const animation_to_play = model.animations[0];
              const action = mixer.clipAction(animation_to_play);
    
              model_object.animation = animation_to_play;
              model_object.action = action;
              if(model_object.animation_loop)
              {
                model_object.action.setLoop(THREE.LoopRepeat)
              }
              else
              {
                model_object.action.setLoop(THREE.LoopOnce)
              }

              model_object.action.setEffectiveTimeScale(model_object.animation_timescale);

              
            }
        
            models.push(model_object);
            if(INDIVIDUAL_ANIMATION_PLAY_ENABLED)
            {
              addPlayButton(model_object)
            }
            

          });
        }
        else if(extension == "fbx")
        {
          const loader = new THREE.FBXLoader(manager);
          const url = "/" + id + "/" + file.name;
          loader.load(url, (fbx) => {
            console.log("fbx added", fbx)
            var model = fbx;
            scene.add(model);
            applyFileTransform(model, file);

            const model_object = {model: model, iframe: {width: file.iframe_width, height: file.iframe_height, url: file.iframe_url, sound_file_name: file.iframe_sound_file_name,
              posLeft: file.iframe_posLeft, posTop: file.iframe_posTop, iframe_openNewWindow: file.iframe_openNewWindow, loop_audio: file.iframe_loop_audio},
              animation_timescale: file.animation_timescale, animation_loop: file.animation_loop}
            
            if(model.animations.length > 0)
            {
              var mixer = new THREE.AnimationMixer( model );
    
              model_object.mixer = mixer;
    
              const animation_to_play = model.animations[0];
              const action = mixer.clipAction(animation_to_play);
    
              model_object.animation = animation_to_play;
              model_object.action = action;
              if(model_object.animation_loop)
              {
                model_object.action.setLoop(THREE.LoopRepeat)
              }
              else
              {
                model_object.action.setLoop(THREE.LoopOnce)
              }

              model_object.action.setEffectiveTimeScale(model_object.animation_timescale);
              
            }
        
            models.push(model_object)

            if(INDIVIDUAL_ANIMATION_PLAY_ENABLED)
            {
              addPlayButton(model_object)
            }

          });

        }
        
      })
   })




}

loadModels();

function getSoundFile () {
  getData("/" + id + "/sound_file").then((soundFile) => {
    console.log(soundFile); // JSON data parsed by `data.json()` call
    document.getElementById("audio-src").src = soundFile;
    document.getElementById("audio").load();
    //document.getElementById("audio").play();
    
    }).finally(()=>{
      document.getElementById("play_button").disabled = false;

      if(AUTOPLAY)
      {
        //Play all animations
        models.forEach((model_object)=>
        {
            if(model_object.action)
            {
              model_object.action.reset();
              model_object.action.play();
            }
        })

        document.getElementById("audio").play();
      }

    });
}



function animate() {
	requestAnimationFrame( animate );

  var delta_time = clock.getDelta();

  models.forEach((model_object)=>
  {
    if(model_object.mixer)
      model_object.mixer.update(delta_time);
  })

  controls.update();

	renderer.render( scene, camera );
}






animate();



async function getData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "omit", // include, *same-origin, omit
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  
  console.log("response", response);
  if(response.status == 200)
  {
    var result = response.text();
    console.log("result", result)
    return result; // parses JSON response into native JavaScript objects
  }
  else 
  {
    return null;
  }
  
  
  
}



// const fitCameraToObject = function ( camera, object, offset, controls ) {

//   offset = offset || 1.25;

//   const boundingBox = new THREE.Box3();

//   // get bounding box of object - this will be used to setup controls and camera
//   boundingBox.setFromObject( object );

//   const center = boundingBox.getCenter();

//   const size = boundingBox.getSize();

//   // get the max side of the bounding box (fits to width OR height as needed )
//   const maxDim = Math.max( size.x, size.y, size.z );
//   const fov = camera.fov * ( Math.PI / 180 );
//   let cameraZ = Math.abs( maxDim / 4 * Math.tan( fov * 2 ) );

//   cameraZ *= offset; // zoom out a little so that objects don't fill the screen

//   camera.position.z = cameraZ;
//   //camera.position.y = size.y;

//   const minZ = boundingBox.min.z;
//   const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

//   camera.far = cameraToFarEdge * 3;
//   camera.updateProjectionMatrix();

//   if ( controls ) {

//     // set camera to rotate around center of loaded object
//     controls.target = center;

//     // prevent camera from zooming out far enough to create far plane cutoff
//     controls.maxDistance = cameraToFarEdge * 2;

//     controls.saveState();

//   } else {

//       camera.lookAt( center )

//  }
// }





async function fetch_cubemap() {

  // px_data_url: px_data_url,
  // nx_data_url: nx_data_url,
  // py_data_url: py_data_url,
  // ny_data_url: ny_data_url,
  // pz_data_url: pz_data_url,
  // nz_data_url: nz_data_url

  var px_data_url = await getData("/" + id + "/cubemap_textures/px_data_url");
  var nx_data_url = await getData("/" + id + "/cubemap_textures/nx_data_url");
  var py_data_url = await getData("/" + id + "/cubemap_textures/py_data_url");
  var ny_data_url = await getData("/" + id + "/cubemap_textures/ny_data_url");
  var pz_data_url = await getData("/" + id + "/cubemap_textures/pz_data_url");
  var nz_data_url = await getData("/" + id + "/cubemap_textures/nz_data_url");

  if(px_data_url && nx_data_url && py_data_url && ny_data_url && pz_data_url && nz_data_url)
  {
    scene.background = new THREE.CubeTextureLoader().load( [
      px_data_url,
      nx_data_url,
      py_data_url,
      ny_data_url,
      pz_data_url,
      nz_data_url
        ] );
  }
  
}

async function fetch_image_background() {

  // px_data_url: px_data_url,
  // nx_data_url: nx_data_url,
  // py_data_url: py_data_url,
  // ny_data_url: ny_data_url,
  // pz_data_url: pz_data_url,
  // nz_data_url: nz_data_url

  
  var image_data_url = await getData("/" + id + "/background_texture/background_image_data_url");
  if(image_data_url)
  {
    const texture = new THREE.TextureLoader().load( image_data_url ); 
    scene.background = texture;
  }
  
}


const play_button = document.getElementById("play_button");
play_button.addEventListener("click", ()=>
{
  const audio = document.getElementById("audio")
  if(!IS_PLAYING)
  {
    play_button.innerText = "Stop";
    audio.play();



    console.log("models", models)
    models.forEach((model_object)=>
    {
        if(model_object.action)
        {
          model_object.action.reset();
          model_object.action.play();
        }
    })
    

    IS_PLAYING = true;
  }
  else if(IS_PLAYING)
  {
    play_button.innerText = "Play";
    models.forEach((model_object)=>
    {
        if(model_object.mixer)
        {
          model_object.mixer.stopAllAction();
        }
    })
    audio.pause();
    audio.currentTime = 0;
    IS_PLAYING = false;
  }


  


})




function mobileAndTabletCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};