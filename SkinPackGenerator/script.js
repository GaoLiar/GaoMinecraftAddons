const generateUuid=($=(a,b)=>(Math.floor(Math.random()*a)+b).toString(16))=>'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/x/g,_=>$(16,0)).replace(/y/g,_=>$(4,8));

$(document).ready(function() {
  $("input#p_uuid").val(generateUuid());
  $("input#m_uuid").val(generateUuid());
  M.AutoInit();
  M.updateTextFields();
});

let imgData = null;
$("#submit-button").click(() => {
  
  let zip = new JSZip();
  let serialize_name = "GaoSkinPack"+generateUuid();
  let pack_id = "GaoSkinPack";
  let pack_name = $("#pack_name").val();
  let skin_name = $("#skin_name").val();

  // manifest
  let manifest = {
    "format_version": 2,
    "header": {
      "description": pack_id,
      "name": pack_id,
      "uuid": $("#p_uuid").val(),
      "version": [0, 0, 1],
    },
    "modules": [
      {
        "description": pack_id,
        "type": "skin_pack",
        "uuid": $("#m_uuid").val(),
        "version": [0, 0, 1]
      }
    ]
  }
  zip.file("manifest.json", JSON.stringify(manifest,undefined,2));

  // skins.json
  let skins = {
    "skins": [
      {
        "localization_name": "Skin",
        "texture": "skin.png",
        "type": "free"
      },
      {
        "localization_name": "SkinA",
        "geometry": "geometry.humanoid.customSlim",
        "texture": "skin.png",
        "type": "free"
      },
    ],
    "serialize_name": serialize_name,
    "localization_name": serialize_name,
  };
  zip.file("skins.json", JSON.stringify(skins,undefined,2));

  // skin image file
  zip.file("skin.png", imgData, {base64: true});

  // texts folder
  var texts = zip.folder("texts");
  texts.file("en_US.lang", [
    `skinpack.${serialize_name}=${serialize_name}`,
    `skin.${serialize_name}.Skin=skin1`,
    `skin.${serialize_name}.SkinA=skin1`,
  ].join("\n"));

  texts.file("ja_JP.lang", [
    `skinpack.${serialize_name}=${pack_name}`,
    `skin.${serialize_name}.Skin=${skin_name}`,
    `skin.${serialize_name}.SkinA=${skin_name}`,
  ].join("\n"));

  zip.generateAsync({type:"blob", mimeType:"application/mcpack"}).then(function(content) {
    Swal.fire({
      title: "スキンパックを生成してダウンロード",
      html: `是非チャンネル登録してください！<div class="g-ytsubscribe" data-channelid="UCplea8gH3d8ZZEVPg2XiMAA" data-layout="full" data-count="default"></div>`,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ダウンロードする'
    }).then((result) => {
      if (result.value) {
        // see FileSaver.js
        saveAs(content, "GaoSkinPack.mcpack");
      }
    });
  });
  return false;
})

$("input[type=file]").change(function() {
  var file = $(this).prop('files')[0];
  if(!file.type.match('image.png')){
    Swal.fire({
        title : "画像タイプの警告",
        text : "この画像の形式は「" + file.type + "」です。スキンに使える画像は「image/png」の画像ファイルだけです。このファイルでは正しくスキンファイルが読み込めない場合があります。",
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