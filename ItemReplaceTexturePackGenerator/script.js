const generateUuid=($=(a,b)=>(Math.floor(Math.random()*a)+b).toString(16))=>'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/x/g,_=>$(16,0)).replace(/y/g,_=>$(4,8));

var item_ids = [
    { name : "エリトラ（装備中）", path : "textures/models/armor/elytra.png", },
    { name : "絵画", path : "textures/painting/kz.png", },
];

$(document).ready(function() {
  $("input#p_uuid").val(generateUuid());
  $("input#m_uuid").val(generateUuid());
  $(".dropdown-trigger").dropdown();
  M.AutoInit();
  M.updateTextFields();
  item_ids.forEach((item) => {
    $('select[name=item_id]').append(
        $('<option>')
            .html(item.name)
            .val(item.path)
    );
  })
});


$("input[type=file]").change(function() {
  var file = $(this).prop('files')[0];
  if(!file.type.match('image.png')){
    Swal.fire({
        title : "画像タイプの警告",
        text : "この画像の形式は「" + file.type + "」です。テクスチャに使える画像は「image/png」の画像ファイルだけです。このファイルでは正しくテクスチャファイルが読み込めない場合があります。",
        icon : "warning",
    });
  }
  var fr=new FileReader();
  fr.onload=function(evt) {
    imgData=evt.target.result.substr(evt.target.result.indexOf("base64,")+"base64,".length);
    $("#submit-button").prop("disabled", false);
    $("#preview").attr("src", evt.target.result);
  }
  fr.readAsDataURL(file);  
})

let imgData = null;
$("#submit-button").click(() => {
  
  Swal.fire({
    title: "テクスチャパックを生成してダウンロード",
    html: `是非チャンネル登録してください！<div class="g-ytsubscribe" data-channelid="UCplea8gH3d8ZZEVPg2XiMAA" data-layout="full" data-count="default"></div>`,
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ダウンロードする'
  }).then((result) => {
    if (result.value) {
      let zip = new JSZip();
      let serialize_name = "GaoTexturePack"+generateUuid();
      let pack_id = "GaoTexturePack";
      let pack_name = $("#pack_name").val() || "ガオのオリジナルテクスチャパック";

      // manifest
      let manifest = {
        "format_version": 2,
        "header": {
          "description": pack_id,
          "name": pack_name,
          "uuid": $("#p_uuid").val(),
          "version": [0, 0, 1],
          "min_engine_version": [ 1, 14, 0 ],
        },
        "modules": [
          {
            "description": pack_id,
            "type": "resources",
            "uuid": $("#m_uuid").val(),
            "version": [0, 0, 1]
          }
        ]
      }
      zip.file("manifest.json", JSON.stringify(manifest,undefined,2));

      // アイコン画像
      zip.file("pack_icon.png", new Promise(function(resolve, reject) 
       {
           JSZipUtils.getBinaryContent("pack_icon.png", function (err, data) 
           {
               if(err) 
               {
                   reject(err);
               } else {
                   resolve(data);
               }
           });
       }));
    
      // texture image file
      let img_path = $("select[name=item_id]").val();
      zip.folder(img_path.substr(0, img_path.lastIndexOf("/")));
      zip.file(img_path, imgData, {base64: true});

      zip.generateAsync({type:"blob"})
        .then(function(content) {
        // see FileSaver.js
        saveAs(content, "GaoTexturePack.mcpack");
      });
    }
  });
  return false;
})
