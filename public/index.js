


import { hasExtension, postData, postFormData, uuidv4, mobileAndTabletCheck } from "./helper_functions.js";


//const SERVER_URL = "http://162.240.165.140:80/"
//const SERVER_URL = "http://localhost:80/"


const IS_MOBILE = mobileAndTabletCheck();

const scene = new THREE.Scene();


const POST_DATA = {
  files: null,
  soundFile: null,
}


var LOOP_SCENE_SOUND = document.getElementById("loop_audio").checked;
document.getElementById("audio").loop = LOOP_SCENE_SOUND;

var INDIVIDUAL_ANIMATION_PLAY = document.getElementById("individual_animation_buttons_checkbox").checked;

const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );


var modal = document.getElementById("myModal");

const renderer = new THREE.WebGLRenderer({antialias: true});

scene.background = new THREE.Color( 0x808080 );

//var mixers = [];
//var animations = [];
var clock = new THREE.Clock();
var animation_index = 0;

var models = [];


const container = document.getElementById("scene-container");
renderer.setSize( container.offsetWidth, container.offsetHeight );
container.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 75, container.offsetWidth / container.offsetHeight, 0.1, 1000 );

camera.position.set(0, 10, 5);

const controls = new THREE.OrbitControls(camera, renderer.domElement);


var light = new THREE.AmbientLight();
scene.add(light)

var INTENSITY = 1;
const lights = [];
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
scene.add( directionalLight );
directionalLight.position.y = 10;

const directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
scene.add( directionalLight2);
directionalLight2.position.z = 5;
directionalLight2.position.y = 5;

const directionalLight3 = new THREE.DirectionalLight( 0xffffff, 1 );
scene.add( directionalLight3);
directionalLight3.position.z = -5;
directionalLight3.position.y = 5;

lights.push(directionalLight, directionalLight2, directionalLight3)




var iframeWidth = 100, iframeHeight = 100;

const DEFAULT_IFRAME_WIDTH = 100;
const DEFAULT_IFRAME_HEIGHT = 100;
//, iframeLeft, iframeTop;

// const helper = new THREE.DirectionalLightHelper( directionalLight );
// scene.add( helper );

// const helper2 = new THREE.DirectionalLightHelper( directionalLight2 );
// scene.add( helper2 );

// const helper3 = new THREE.DirectionalLightHelper( directionalLight3);
// scene.add( helper3 );
//directionalLight.position.set(0, 0, -10);


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
  console.log("intersects", intersects)

  if(intersects.length == 0)
  {
    return;
  }



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
        if(selected_model_object.iframe.openNewWindow)
        {
          const newTabUrl = "/link_page/iframeNewWindow.html?sound=undefined&url=" + encodeURI(selected_model_object.iframe.url);
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

        const url = selected_model_object.iframe.sound_file_url;
        console.log("sound_file_url", url)
        if(url)
        {
          //alert("Play")
          src.src = url;
          audio.load();
          audio.play();
          audio.loop = selected_model_object.iframe.audio_loop;

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


window.addEventListener("resize", ()=>
{

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.offsetWidth, container.offsetHeight );

})



function animate() {
	requestAnimationFrame( animate );


  var delta_time = clock.getDelta();

  // mixers.forEach((mixer)=>
  // {
  //   mixer.update( delta_time );
  // })

  models.forEach((model_object)=>
  {
    if(model_object.mixer)
      model_object.mixer.update(delta_time);
  })
  controls.update();

	renderer.render( scene, camera );
}




const file_inputElement = document.getElementById("model-uploader");
file_inputElement.addEventListener("change", handleFiles, false);
function handleFiles() {
  const file = file_inputElement.files[0];


  let reader = new FileReader();

  reader.readAsArrayBuffer(file);

  reader.onload = function() {
    console.log(reader.result);
    const result = reader.result;




    if(hasExtension("model-uploader", [".glb"]))
    {
      const loader = new THREE.GLTFLoader();
      const url = URL.createObjectURL(file);
      loader.load(url, (gltf) => {
        console.log("gltf added", gltf)
        var model = gltf.scene;
        scene.add(model);
        model.animations.push(...gltf.animations);




        var model_object = {
          model: model,
          name: file.name,
          file: file,
          iframe: {width: DEFAULT_IFRAME_WIDTH, height: DEFAULT_IFRAME_HEIGHT, url: "", posLeft: 0, posTop: 0, openNewWindow: false},
          animation_options: {timeScale: 1, loop: true},
          // mixer: mixer,
          // animation: animation_to_play,
          // action: action
        }
    
        if(model.animations.length > 0)
        {
          var mixer = new THREE.AnimationMixer( model );

          model_object.mixer = mixer;

          const animation_to_play = model.animations[0];
          animation_to_play.animation_index = animation_index;
          const action = mixer.clipAction(animation_to_play);

          model_object.animation = animation_to_play;
          model_object.action = action;
        }
        


        models.push(model_object);

        

        addModelControls(model_object, file.name)
        
      });
    }
    else if(hasExtension("model-uploader", [".fbx"]))
    {
      const loader = new THREE.FBXLoader();
      const url = URL.createObjectURL(file);
      loader.load(url, (fbx) => {
        console.log("fbx", fbx);
        const model = fbx;
        scene.add(model);
        
        var model_object = {
          model: model,
          name: file.name,
          file: file,
          iframe: {width: DEFAULT_IFRAME_WIDTH, height: DEFAULT_IFRAME_HEIGHT, url: "", posLeft: 0, posTop: 0, openNewWindow: false},
          animation_options: {timeScale: 1, loop: true},
          // mixer: mixer,
          // animation: animation_to_play,
          // action: action
        }
    
        if(model.animations.length > 0)
        {
          var mixer = new THREE.AnimationMixer( model );

          model_object.mixer = mixer;

          const animation_to_play = model.animations[0];
          animation_to_play.animation_index = animation_index;
          const action = mixer.clipAction(animation_to_play);

          model_object.animation = animation_to_play;
          model_object.action = action;
        }
        models.push(model_object);

        addModelControls(model_object, file.name)
      });
    }

    


  };

  reader.onerror = function() {
    console.log(reader.error);
  };

  console.log("file", file)
//   const loader = THREE.GLTFLoader();
//   loader.load()
}






var audio_input = document.getElementById("audio-upload")
audio_input.addEventListener("change", handleAudioUpload, false);
function handleAudioUpload(event) {
  const file = audio_input.files[0];
  
  console.log("file name", file.name)

  let reader = new FileReader();

  reader.readAsDataURL(file);

  reader.onload = function() {
    console.log(reader.result);
    POST_DATA.soundFile = reader.result;
    POST_DATA.soundFileName = file.name;
  };

  reader.onerror = function() {
    console.log(reader.error);
  };

  const url = URL.createObjectURL(file);
  var src = document.getElementById("audio-src");
  src.src = url;
  document.getElementById("audio").load();
  
}


const background_color_input = document.getElementById("colorpicker");
background_color_input.addEventListener("change", (event)=>
{
  var color = event.target.value;

  scene.background = new THREE.Color( color );
  POST_DATA.scene_background_color = color.replace("#","");

  if(POST_DATA.image_background)
  {
    delete POST_DATA.image_background;
    document.getElementById("image_background").value = "";
  }

  if(POST_DATA.cubemap)
  {
    delete POST_DATA.cubemap;
    document.getElementById("px").value = "";
    document.getElementById("nx").value = "";
    document.getElementById("py").value = "";
    document.getElementById("ny").value = "";
    document.getElementById("pz").value = "";
    document.getElementById("nz").value = "";
  }


  

});


function addModelControls(model_object, model_name)
{
  const model = model_object.model;

  const parent_container = document.getElementById("model-controls");

  const container = document.createElement("div");
  container.className = "model-controls-container";
  container.style.marginBottom = "5px"
  parent_container.appendChild(container);

  const model_name_div = document.createElement("div");
  model_name_div.innerText = model_name;
  model_name_div.className = "model_name_div"
  container.appendChild(model_name_div);

  const delete_button = document.createElement("button");
  container.appendChild(delete_button);
  delete_button.innerText = "X";
  delete_button.className = "close-model-button";
  delete_button.addEventListener("click", ()=>
  {
    scene.remove(model);

    const index = models.findIndex((object)=>
    {
      return object.name == model_name;
    })
    models.splice(index, 1);

    parent_container.removeChild(container);
  });

  container.appendChild(document.createElement("br"));


  const lef_position_label = document.createElement("label");
  lef_position_label.innerText = "Position model from left: ";
  const lef_position_input = document.createElement("input");
  lef_position_input.type="number";
  lef_position_input.min="-100" 
  lef_position_input.max="100" 
  lef_position_input.value="0";
  lef_position_input.id = "lef_position_input";
  lef_position_label.appendChild(lef_position_input);
  lef_position_input.addEventListener("change", (event)=>
  {
    var value = parseFloat(event.target.value);
    if(isNaN(value))
    {
      value = 0;
    }
    model.position.x = value;

  });
  container.appendChild(lef_position_label);
  //container.appendChild(document.createElement("br"));


  const bottom_position_label = document.createElement("label");
  bottom_position_label.innerText = " bottom: ";

  const bottom_position_input = document.createElement("input");
  bottom_position_input.type="number";
  bottom_position_input.min="-100" 
  bottom_position_input.max="100" 
  bottom_position_input.value="0";
  bottom_position_input.id = "bottom_position_label";

  bottom_position_label.appendChild(bottom_position_input);

  bottom_position_input.addEventListener("change", (event)=>
  {
    var value = parseFloat(event.target.value);
    if(isNaN(value))
    {
      value = 0;
    }
    model.position.y = value;

  });
  container.appendChild(bottom_position_label);
  //container.appendChild(document.createElement("br"));


  const depth_position_label = document.createElement("label");
  depth_position_label.innerText = " Model depth: ";

  const depth_position_input = document.createElement("input");
  depth_position_input.type="number";
  depth_position_input.min="-100" 
  depth_position_input.max="100" 
  depth_position_input.value="0";
  depth_position_input.id = "depth_position_label";

  depth_position_label.appendChild(depth_position_input);

  depth_position_input.addEventListener("change", (event)=>
  {
    var value = parseFloat(event.target.value);
    if(isNaN(value))
    {
      value = 0;
    }
    model.position.z = value;

  });
  container.appendChild(depth_position_label);
  container.appendChild(document.createElement("br"));


  const scale_position_label = document.createElement("label");
  scale_position_label.innerText = " Scale model: ";

  const scale_position_input = document.createElement("input");
  scale_position_input.type="number";
  scale_position_input.min="0.001";
  scale_position_input.max="100" 
  scale_position_input.step="0.1" 
  scale_position_input.value="1";
  scale_position_input.id = "scale_position_input";

  scale_position_label.appendChild(scale_position_input);

  scale_position_input.addEventListener("change", (event)=>
  {
    var value = parseFloat(event.target.value);
    if(isNaN(value))
    {
      value = 0;
    }
    model.scale.set(value, value, value);

  });
  container.appendChild(scale_position_label);
  container.appendChild(document.createElement("br"));


  const rotateX_label = document.createElement("label");
  rotateX_label.innerText = "Rotate model in X axis: ";
  const rotateX_input = document.createElement("input");
  rotateX_input.type="number";
  rotateX_input.min="-100" 
  rotateX_input.max="100" 
  rotateX_input.value="0";
  rotateX_input.step="0.1";
  rotateX_input.id = "lef_position_input";
  rotateX_label.appendChild(rotateX_input);
  rotateX_input.addEventListener("change", (event)=>
  {
    var value = parseFloat(event.target.value);
    if(isNaN(value))
    {
      value = 0;
    }
    model.rotation.x = value;

  });
  container.appendChild(rotateX_label);
  //container.appendChild(document.createElement("br"));

  const rotateY_label = document.createElement("label");
  rotateY_label.innerText = " Y axis: ";
  const rotateY_input = document.createElement("input");
  rotateY_input.type="number";
  rotateY_input.min="-100" 
  rotateY_input.max="100" 
  rotateY_input.value="0";
  rotateY_input.step="0.1";
  rotateY_input.id = "lef_position_input";
  rotateY_label.appendChild(rotateY_input);
  rotateY_input.addEventListener("change", (event)=>
  {
    var value = parseFloat(event.target.value);
    if(isNaN(value))
    {
      value = 0;
    }
    model.rotation.y = value;

  });
  container.appendChild(rotateY_label);
  //container.appendChild(document.createElement("br"));

  const rotateZ_label = document.createElement("label");
  rotateZ_label.innerText = " Z axis: ";
  const rotateZ_input = document.createElement("input");
  rotateZ_input.type="number";
  rotateZ_input.min="-100" 
  rotateZ_input.max="100" 
  rotateZ_input.value="0";
  rotateZ_input.step="0.1";
  rotateZ_input.id = "lef_position_input";
  rotateZ_label.appendChild(rotateZ_input);
  rotateZ_input.addEventListener("change", (event)=>
  {
    var value = parseFloat(event.target.value);
    if(isNaN(value))
    {
      value = 0;
    }
    model.rotation.z = value;

  });
  container.appendChild(rotateZ_label);
  container.appendChild(document.createElement("br"));


  const play_animation_button = document.createElement("button");
  play_animation_button.innerText = "Add model animation to the scene";
  play_animation_button.addEventListener("click", (e)=>
  {

    e.stopPropagation();

    model_object.action.reset();
    model_object.action.play();

  });

  container.appendChild(play_animation_button);

  if(model.animations.length == 0)
  {
    play_animation_button.disabled = true;
  }


  const animation_timescale_label = document.createElement("label");
  animation_timescale_label.innerText = " Animation timescale: ";
  const animation_timescale_input = document.createElement("input");
  animation_timescale_input.type="number";
  animation_timescale_input.min="-100" 
  animation_timescale_input.max="100" 
  animation_timescale_input.value="1";
  animation_timescale_input.step="0.1";
  animation_timescale_label.appendChild(animation_timescale_input);
  animation_timescale_input.addEventListener("change", (event)=>
  {
    var value = parseFloat(event.target.value);
    if(isNaN(value))
    {
      value = 0;
    }
    model_object.action.setEffectiveTimeScale(value);
    model_object.animation_options.timeScale = value;

  });
  container.appendChild(animation_timescale_label);

  if(model.animations.length == 0)
  {
    animation_timescale_input.disabled = true;
  }


  const animation_loop_label = document.createElement("label");
  animation_loop_label.innerText = " Animation Loop: ";
  const animation_loop_input = document.createElement("input");
  animation_loop_input.type="checkbox";
  animation_loop_input.checked = true;
  animation_loop_label.appendChild(animation_loop_input);
  animation_loop_input.addEventListener("change", (event)=>
  {
    var checked = event.target.checked;
    if(checked)
    {
      model_object.action.setLoop(THREE.LoopRepeat)
    }
    else
    {
      model_object.action.setLoop(THREE.LoopOnce)
    }
    model_object.animation_options.loop = checked;

  });
  container.appendChild(animation_loop_label);

  if(model.animations.length == 0)
  {
    animation_loop_input.disabled = true;
  }


  container.appendChild(document.createElement("br"));


  const add_iframe_label = document.createElement("label");
  add_iframe_label.innerText = "Add model iframe url: ";
  const add_iframe_input= document.createElement("input");
  add_iframe_input.type="text";

  add_iframe_label.appendChild(add_iframe_input);
  add_iframe_input.addEventListener("change", (event)=>
  {
    var url = event.target.value;  
    model_object.iframe.url = url;
  });
  container.appendChild(add_iframe_label);
  container.appendChild(document.createElement("br"));


  const width_iframe_label = document.createElement("label");
  width_iframe_label.innerText = "Iframe width: ";
  const width_iframe_input= document.createElement("input");
  width_iframe_input.type="number";
  width_iframe_input.value = 100;
  width_iframe_input.min = 1;

  width_iframe_label.appendChild(width_iframe_input);
  width_iframe_input.addEventListener("change", (event)=>
  {
    var iframe_width = parseInt(event.target.value);
    if(isNaN(iframe_width))
    {
      iframe_width = 1;
      width_iframe_input.value = 1;
    }
    if(iframe_width <=0)
    {
      alert("enter correct iframe width value");
      return;
    }
    model_object.iframe.width = iframe_width;
  });
  container.appendChild(width_iframe_label);

  const height_iframe_label = document.createElement("label");
  height_iframe_label.innerText = " Iframe height: ";
  const height_iframe_input= document.createElement("input");
  height_iframe_input.type="number";
  height_iframe_input.value = 100;
  height_iframe_input.min = 1;

  height_iframe_label.appendChild(height_iframe_input);
  height_iframe_input.addEventListener("change", (event)=>
  {
    var iframe_height = parseInt(event.target.value);
    if(isNaN(iframe_height))
    {
      iframe_height = 1;
      height_iframe_input.value = 1;
    }
    if(iframe_height <=0)
    {
      alert("enter correct iframe height value");
      return;
    }
    model_object.iframe.height = iframe_height;
  });
  container.appendChild(height_iframe_label);


  const new_window_iframe_label = document.createElement("label");
  new_window_iframe_label.innerText = " Open iframe in a new window: ";
  const new_window_iframe_input= document.createElement("input");
  new_window_iframe_input.type="checkbox";
  new_window_iframe_input.checked = false;

  new_window_iframe_label.appendChild(new_window_iframe_input);
  new_window_iframe_input.addEventListener("change", (event)=>
  {
    const new_window_iframe = event.target.checked;
    model_object.iframe.openNewWindow = new_window_iframe;
  });
  container.appendChild(new_window_iframe_label);

  container.appendChild(document.createElement("br"));


  const audio_iframe_label = document.createElement("label");
  audio_iframe_label.innerText = "Iframe audio: ";
  const audio_iframe_input= document.createElement("input");
  audio_iframe_input.type="file";
  audio_iframe_input.accept="audio/*";

  audio_iframe_label.appendChild(audio_iframe_input);


  audio_iframe_input.addEventListener("change", handleAudioUpload, false);
  function handleAudioUpload(event) {
    const file = audio_iframe_input.files[0];

    model_object.iframe.sound_file = file;
    model_object.iframe.sound_file_name = file.name;
    
    console.log("file name", file.name)
  
    const url = URL.createObjectURL(file);
    // var src = document.getElementById("iframe-audio-src");
    // src.src = url;
    // document.getElementById("iframe_audio").load();

    model_object.iframe.sound_file_url = url;
    
  }

  container.appendChild(audio_iframe_label);


  const iframe_audio_loop_label = document.createElement("label");
  iframe_audio_loop_label.innerText = " Loop audio: ";
  const iframe_audio_loop_input = document.createElement("input");
  iframe_audio_loop_input.type="checkbox";
  iframe_audio_loop_input.checked = false;
  model_object.iframe.audio_loop = iframe_audio_loop_input.checked;
  iframe_audio_loop_label.appendChild(iframe_audio_loop_input);
  iframe_audio_loop_input.addEventListener("change", (event)=>
  {
    model_object.iframe.audio_loop = event.target.checked;

  });
  container.appendChild(iframe_audio_loop_label);







  container.appendChild(document.createElement("br"));

  const iframe_pos_left_label = document.createElement("label");
  iframe_pos_left_label.innerText = "Iframe position in px left: ";
  const iframe_pos_left_input= document.createElement("input");
  iframe_pos_left_input.type="number";
  iframe_pos_left_input.value = 0;
  iframe_pos_left_input.min = 0;

  iframe_pos_left_label.appendChild(iframe_pos_left_input);
  iframe_pos_left_input.addEventListener("change", (event)=>
  {
    const iframe_position_left = parseInt(event.target.value);
    if(iframe_position_left < 0)
    {
      alert("enter correct iframe_position_left value");
      return;
    }
    model_object.iframe.posLeft = iframe_position_left;
  });
  container.appendChild(iframe_pos_left_label);

  const iframe_pos_top_label = document.createElement("label");
  iframe_pos_top_label.innerText = " top: ";
  const iframe_pos_top_input= document.createElement("input");
  iframe_pos_top_input.type="number";
  iframe_pos_top_input.value = 0;
  iframe_pos_top_input.min = 0;

  iframe_pos_top_label.appendChild(iframe_pos_top_input);
  iframe_pos_top_input.addEventListener("change", (event)=>
  {
    const iframe_position_top = parseInt(event.target.value);
    console.log("iframe_position_top", iframe_position_top)
    model_object.iframe.posTop = iframe_position_top;
    console.log("model_object.iframe", model_object.iframe)
  });
  container.appendChild(iframe_pos_top_label);
  container.appendChild(document.createElement("br"));





}



document.getElementById("save-scene").addEventListener("click", async (e)=>
{




  
  e.preventDefault();

  if(document.getElementById("iframe").checked)
  {
    if (iframeWidth <= 0 || iframeHeight <=0) {
      console.log("Incorrect iframeWidth", iframeWidth, "iframeHeight", iframeHeight )
      alert("Enter correct iframe width and height");
      return;
      
    }
  }

  POST_DATA.files = [];
  POST_DATA.fileList = [];



  console.log("camera", camera);
  console.log("controls", controls)


  console.log("models", models);
  models.forEach((model)=>
  {
    POST_DATA.files.push({name: model.name, file: model.file});
    if(model.iframe.sound_file)
    {
      POST_DATA.files.push({name: model.iframe.sound_file.name, file: model.iframe.sound_file})
    }
    POST_DATA.fileList.push({
      name: model.name,
      positionX: model.model.position.x,
      positionY: model.model.position.y,
      positionZ: model.model.position.z,
      scale: model.model.scale.x,
      rotationX: model.model.rotation.x,
      rotationY: model.model.rotation.y,
      rotationZ: model.model.rotation.z,
      cameraPosX: camera.position.x,
      cameraPosY: camera.position.y,
      cameraPosZ: camera.position.z,
      cameraRotX: camera.rotation.x,
      cameraRotY: camera.rotation.y,
      cameraRotZ: camera.rotation.z,
      controlsTargetX: controls.target.x,
      controlsTargetY: controls.target.y,
      controlsTargetZ: controls.target.z,
      iframe_sound_file_name: model.iframe.sound_file_name,
      iframe_loop_audio: model.iframe.audio_loop,
      iframe_url : model.iframe.url,
      iframe_width: model.iframe.width,
      iframe_height: model.iframe.height,
      iframe_posLeft: model.iframe.posLeft,
      iframe_posTop: model.iframe.posTop,
      iframe_openNewWindow: model.iframe.openNewWindow,
      animation_timescale: model.animation_options.timeScale,
      animation_loop: model.animation_options.loop,

      
    }
      );
  })

  //console.log("POST_DATA.files", POST_DATA.files)



  var totalFileSize = 0;
  const LIMIT = 1000; //MB

  POST_DATA.files.forEach((file)=>
  {
    console.log("file", file)
    totalFileSize += file.file.size;
  })

  console.log("totalFileSize", totalFileSize);
  if(totalFileSize/1000000 > LIMIT)
  {
    alert("Your scene is too heavy! Please remove some elements or optimize the file size. Limit is 20mb");
    return;

  }
      const save_button = document.getElementById("save-scene");
      const spinner = document.getElementById("spinner");
      save_button.disabled = true;
      spinner.style.display = "inline-block";



      const uuid = uuidv4();
      POST_DATA.id = uuid;

      const data = new FormData();
      POST_DATA.files.forEach((file)=>
      {
        data.append("files", file.file, file.name)
      });
      POST_DATA.files = [];
      data.append("directory", uuid)

      postFormData("upload_models", data).then((data)=>
      {
        return postData("fileupload", POST_DATA);
      }).then((data) => {
        console.log(data); // JSON data parsed by `data.json()` call
        modal.style.display = "block";
        const backgound_color = POST_DATA.scene_background_color ? POST_DATA.scene_background_color : "808080";
        const autoplay = document.getElementById("animation_autoplay_checkbox").checked;
        const save_link = "link_page/index.html?id="+ uuid + "&backgroundColor=" + backgound_color+"&autoplay=" + autoplay + "&intensity=" + INTENSITY
        + "&platform=" + gridHelper.visible + "&loop_scene_audio=" + LOOP_SCENE_SOUND + "&individual_animation_playbuttons=" + INDIVIDUAL_ANIMATION_PLAY;
        document.getElementById("modal_text").href = save_link;
        document.getElementById("modal_text").rel = "prefetch";
        document.getElementById("modal_text").innerText = document.getElementById("modal_text").href;

        //modal_iframe_text
        const IFRAME_ENABLED = document.getElementById("iframe").checked;
        console.log("IFRAME_ENABLED", IFRAME_ENABLED)
        if(IFRAME_ENABLED)
        {
          //<iframe src="https://profoundbe.com/button/Aeo1c7DxIF2M0IkSMrmt" width="100%" height="300"></iframe>
          document.getElementById("modal_iframe_text").style.display = "block"
          const template = "<iframe src=\"" + document.getElementById("modal_text").href + "\" width=\""+ iframeWidth+ "\" height=\"" +iframeHeight + "\"" +">" + "</iframe>";
          document.getElementById("iframe-code").innerText = template;
        }
        else
        {
          document.getElementById("modal_iframe_text").style.display = "none"
          document.getElementById("iframe-code").innerText = "";
        }
        save_button.disabled = false;
        spinner.style.display = "none";
        }).catch((error)=>
        {
          alert("Error uploading files", error);
          console.log("Error uploading files", error)
        })


})

animate();



//MODAL 
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }


const read = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (event) => resolve(event.target.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const add_cubemap_button = document.getElementById("add_cubemap");
add_cubemap_button.addEventListener(("click"), async (e)=>
{
  e.preventDefault();
  
  const px_file_form = document.getElementById("px");
  const nx_file_form = document.getElementById("nx");
  const py_file_form = document.getElementById("py");
  const ny_file_form = document.getElementById("ny");
  const pz_file_form = document.getElementById("pz");
  const nz_file_form = document.getElementById("nz");


  if(px_file_form.files.length == 0 || nx_file_form.files.length == 0 || py_file_form.files.length == 0
    || ny_file_form.files.length == 0 || pz_file_form.files.length == 0 || nz_file_form.files.length == 0)
  {
      alert("Error! All cubemap fields are required for cubemap background");
      return;
  }

  const px_data_url = await read(px_file_form.files[0]);
  const nx_data_url = await read(nx_file_form.files[0]);
  const py_data_url = await read(py_file_form.files[0]);
  const ny_data_url = await read(ny_file_form.files[0]);
  const pz_data_url = await read(pz_file_form.files[0]);
  const nz_data_url = await read(nz_file_form.files[0]);

  scene.background = new THREE.CubeTextureLoader().load( [
    px_data_url,
    nx_data_url,
    py_data_url,
    ny_data_url,
    pz_data_url,
		nz_data_url
			] );


  POST_DATA.cubemap = {
    px_data_url: px_data_url,
    nx_data_url: nx_data_url,
    py_data_url: py_data_url,
    ny_data_url: ny_data_url,
    pz_data_url: pz_data_url,
		nz_data_url: nz_data_url
  }

  if(POST_DATA.image_background)
  {
    delete POST_DATA.image_background;
    document.getElementById("image_background").value = "";
  }




})


const image_background_input = document.getElementById("image_background");
image_background_input.addEventListener("change", async (e) =>
{
  e.preventDefault();
  var image_background_dataurl;
  try {
    image_background_dataurl = await read(image_background_input.files[0]);
    const texture = new THREE.TextureLoader().load( image_background_dataurl ); 
    scene.background = texture;
    POST_DATA.image_background = {
      image: image_background_dataurl
    }

    if(POST_DATA.cubemap)
    {
      delete POST_DATA.cubemap;
      document.getElementById("px").value = "";
      document.getElementById("nx").value = "";
      document.getElementById("py").value = "";
      document.getElementById("ny").value = "";
      document.getElementById("pz").value = "";
      document.getElementById("nz").value = "";
    }

  } catch (error) {
    alert(error)
  }
})



const light_intensity_input = document.getElementById("intensity");
light_intensity_input.addEventListener("change", async (e) =>
{
  e.preventDefault();

  lights.forEach((light)=>
  {
    const value = parseFloat(e.target.value)
    if(isNaN(value))
    {
      value = 0;
    }
    light.intensity = parseFloat(value)
    INTENSITY = value;
  })
  
})


const platform_checkbox = document.getElementById("platform");
platform_checkbox.addEventListener("change", async (e) =>
{
  e.preventDefault();

  if(e.target.checked)
  {
    gridHelper.visible = true;
  }
  else
  {
    gridHelper.visible = false;
  }

})




const iframe_checkbox = document.getElementById("iframe");
iframe_checkbox.addEventListener(("change"), (e)=>
{
  e.preventDefault();
  if(e.target.checked)
  {
    document.getElementById("iframewidth").disabled = false;
    document.getElementById("iframeheight").disabled = false;
    // document.getElementById("iframeFromLeft").disabled = false;
    // document.getElementById("iframeFromTop").disabled = false;
  }
  else
  {
    document.getElementById("iframewidth").disabled = true;
    document.getElementById("iframeheight").disabled = true;
    // document.getElementById("iframeFromLeft").disabled = true;
    // document.getElementById("iframeFromTop").disabled = true;
  }
  
})


const iframewidthInput = document.getElementById("iframewidth");
iframewidthInput.addEventListener(("change"), (e)=>
{
  e.preventDefault();
  
  iframeWidth = parseInt(e.target.value);
  if(isNaN(iframeWidth))
  {
    iframeWidth = 0;
  }
  console.log("changed iframe width", iframeWidth)

})

const iframeHeightInput = document.getElementById("iframeheight");
iframeHeightInput.addEventListener(("change"), (e)=>
{
  e.preventDefault();
  iframeHeight = parseInt(e.target.value);
  if(isNaN(iframeHeight))
  {
    iframeHeight = 0;
  }

})

// const iframeFromLeft = document.getElementById("iframeFromLeft");
// iframeFromLeft.addEventListener(("change"), (e)=>
// {
//   e.preventDefault();
//   iframeLeft = e.target.value;

// })

// const iframeFromTop = document.getElementById("iframeFromTop");
// iframeFromTop.addEventListener(("change"), (e)=>
// {
//   e.preventDefault();
//   iframeTop = e.target.value;

// })



document.getElementById("loop_audio").addEventListener("change", (e)=>
{
  LOOP_SCENE_SOUND = e.target.checked;
  document.getElementById("audio").loop = LOOP_SCENE_SOUND;

})

document.getElementById("individual_animation_buttons_checkbox").addEventListener("change", (e)=>
{
  INDIVIDUAL_ANIMATION_PLAY = e.target.checked;

})

document.getElementById("animation_autoplay_checkbox").addEventListener("change", (e)=>
{
  const checked = e.target.checked;

    document.getElementById("individual_animation_buttons_checkbox").checked = !checked;
    INDIVIDUAL_ANIMATION_PLAY = !checked;
    document.getElementById("individual_animation_buttons_checkbox").disabled = checked;


})


