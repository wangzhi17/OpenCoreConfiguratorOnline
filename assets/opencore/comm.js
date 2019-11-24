function enabledFormat(cellvalue) {
    if(cellvalue === true || cellvalue === 'true' || cellvalue === 'YES') {
        return 'YES';
    } else {
        return 'NO';
    }
}


//<string>HfsPlus.efi</string>
//<string>ApfsDriverLoader.efi</string>
//<string>FwRuntimeServices.efi</string>
//转为
//['HfsPlus.efi','ApfsDriverLoader.efi','FwRuntimeServices.efi']
// 返回一个基本值数组
function parsePlistArray2stringArray(context) {
    if(context === '') return [];
    let idx1=0,idx2=0,idx3=0,key='', rarray=[];
    while(true) {
        let item = {};
        idx1 = context.indexOf('<', idx3);
        if(idx1 === -1) break;
        idx2 = context.indexOf('>', idx1);
        //console.log(context.slice(idx1+1, idx2));
        item['Type'] = context.slice(idx1+1, idx2);

        key = '</' + context.slice(idx1+1, idx2+1)

        idx3 = context.indexOf(key, idx2);

        //console.log(context.slice(idx2, idx3));
        item['Volume'] = context.slice(idx2 + 1, idx3);
        rarray.push(item);
        idx3 += key.length;
    }
    
    return rarray;
}

function partrue(boolvalue) {
    return boolvalue === true ? true : false;
}


/**
从字符串
<key>PciRoot(0x0)/Pci(0x1b,0x0)</key>
<array>
    <string>MaximumBootBeepVolume</string>
</array>
<key>PciRoot(0x0)/Pci(0x1b,0x2)</key>
<array>
    <string>MinimumBootBeepVolume</string>
    <string>MaximumBootBeepVolume</string>
</array>
返回数组 ['PciRoot(0x0)/Pci(0x1b,0x0)', 'PciRoot(0x0)/Pci(0x1b,0x2)']
**/
function getKeyarrayZIkey(context) {
    if(context === '') return [];

    let idx0=0,idx1=0,rarray=[];

    while(true) {
        idx0 = context.indexOf('<key>', idx1);
        if(idx0 === -1) break;
        idx1 = context.indexOf('</key>', idx0 + 5);
        rarray.push(context.slice(idx0+5, idx1));
        idx1 += 6;
    }
    
    return rarray;

}

/**
从字符串
<key>PciRoot(0x0)/Pci(0x1b,0x0)</key>
<array>
    <string>MaximumBootBeepVolume</string>
</array>
<key>PciRoot(0x0)/Pci(0x1b,0x2)</key>
<array>
    <string>MinimumBootBeepVolume</string>
    <string>MaximumBootBeepVolume</string>
</array>
返回对象数组 [{pid:0,Volume:'MaximumBootBeepVolume'}, {pid:1,Volume:'MinimumBootBeepVolume'}, {pid:1, Volume:'MaximumBootBeepVolume'}]
**/
function getKeyarrayZIarray(context) {
    if(context === '') return [];

    let idx0=0,idx1=0,rarray=[],pid=0;

    while(true) {
        idx0 = context.indexOf('<array>', idx1);
        if(idx0 === -1) break;
        idx1 = context.indexOf('</array>', idx0 + 7);
        //rarray.push(context.slice(idx0+7, idx1));
        let arrayTemp = parsePlistArray2stringArray(context.slice(idx0+7, idx1));
        //console.log(arrayTemp);
        for(let it=0;it<arrayTemp.length;it++) {
            rarray.push({pid:pid, Volume:arrayTemp[it]['Volume'], Type:arrayTemp[it]['Type']});
        }

        idx1 += 8;
        pid ++;
    }
    
    return rarray;

}



/**
从字符串
<key>PciRoot(0x0)/Pci(0x1b,0x0)</key>
<dict>
    <key>layout-id</key>
    <data>AQAAAA==</data>
</dict>
<key>PciRoot(0x0)/Pci(0x2,0x0)</key>
<dict>
    <key>AAPL,ig-platform-id</key>
    <data></data>
</dict>

返回 ['PciRoot(0x0)/Pci(0x1b,0x0)', 'PciRoot(0x0)/Pci(0x2,0x0)']
**/
function getParentKeys(context) {
    if(context === '') return [];

    let idx1 = 0, idx2 = 0, idx3 = 0, key = '', rarray = [];
    while(true) {
        idx1 = context.indexOf('<dict>', idx1);
        if(idx1 === -1) break;
        idx2 = context.lastIndexOf('</key>', idx1);
        idx3 = context.lastIndexOf('<key>', idx2);
        //console.log(context.slice(idx3 + 5, idx2));
        rarray.push(context.slice(idx3 + 5, idx2));
        idx1 += 5;
    }
    //console.log(rarray);
    return rarray;
}

/**
从字符串
<key>PciRoot(0x0)/Pci(0x1b,0x0)</key>
<dict>
    <key>layout-id</key>
    <data>AQAAAA==</data>
    <key>name</key>
    <string>guozzzz</string>
</dict>
<key>PciRoot(0x0)/Pci(0x2,0x0)</key>
<dict>
    <key>AAPL,ig-platform-id</key>
    <data>aaaa==</data>
</dict>
返回 [{layout-id:'AQAAAA==', name:'guozzzz'}, {AAPL,ig-platform-id:'aaaa=='}]
**/
function getSubKeys(context) {
    if(context === '') return [];

    let idx1 = 0, idx2 = 0, rarray = [],pid = 0;

    
    while(true) {
    	idx1 = context.indexOf('</dict>', idx1);
    	if(idx1 === -1) break;
    	idx2 = context.lastIndexOf('<dict>', idx1);
    	pdictToJSobjectKV(context.slice(idx2 + 6, idx1), pid, rarray);
    	idx1 += 7;
    	pid ++;
    }
    //console.log(return rarray;);
    return rarray;
}

//把一个plist的array变成js中的array
//只适用于array下是一个dcit
function parrayToJSarray(context) {
    if(context === '') return [];

    let rarray = [], idx1 = 0, idx2 = 0, dicttext = '';
    while(true) {
        idx1 = context.indexOf('<dict>', idx2);
        if(idx1 === -1) break;
        idx2 = context.indexOf('</dict>', idx1);

        dicttext = context.slice(idx1 + 6, idx2);
        let item = pdictToJSobject(dicttext);
        rarray.push(item);
        //console.log(dicttext);

    }
    //console.log(rarray);
    return rarray;
}

// 把 <key>name</key><string>xieguozhong</string>
//     <key>sex</key><string>F</string>
// 转成 {name:'xieguozhong', sex:'F'}
// 只返回一个对象
function pdictToJSobject(context) {
    if(context === '') return {};
    let robj = {};
    let idx1 = 0, idx2 = 0, key='', value = '';
    while(true) {
        idx1 = context.indexOf('<key>', idx2);
        if(idx1 === -1) break;
        idx2 = context.indexOf('</key>', idx1);
        key = context.slice(idx1 + 5, idx2);
        value = getValuesByKeyname(context, key);
        robj[key] = value;
    }
    return robj;
}


//把 <key>name</key><string>xieguozhong</string>
//转成 {key:'name', value:'xieguozhong'}
// 
function pdictToJSobjectKV(context, pid, rarray) {
    if(context === '') return [];
    let idx1 = 0, idx2 = 0, idx3 = 0, idx4 = 0, key='', value = '', vtype = '';
    while(true) {
    	let item = {};

        //1 找key
        idx1 = context.indexOf('<key>', idx2);
        if(idx1 === -1) break;
        idx2 = context.indexOf('</key>', idx1);
        key = context.slice(idx1 + 5, idx2);

        //2 接着找数据类型
        idx3 = context.indexOf('<', idx2 + 6);
        idx4 = context.indexOf('>', idx3);
        vtype = context.slice(idx3 + 1, idx4);
        //console.log(vtype);
        //3 再找值
        value = getValuesByKeyname(context, key);
        //robj[key] = value;
        item['pid'] = pid;
        item['Key'] = key;
        item['Type'] = vtype;
        item['Value'] = value;
        rarray.push(item);
    }
    
}

// //获取 'ACPI:App的格式取值'
// function getValuesByKeynames(context, keynames) {
//     keynames = keynames.split(":");
//     for(let i=0;i<keynames.length;i++) {

//         context = getValuesByKeyname(context, keynames[i]);
//     }
//     return context;
// }

function getValuesByKeyname(context, keyname, istop) {
    if(context === '') {
        return '';
    }
    keyname = '<key>' + keyname + '</key>';

    if(istop === true) {
        istop = '<dict>';
    } else {
        istop = '';
    }

    let ix1=0;ix2=0,ix3=0;
    ix1 = context.indexOf(keyname + istop);
    if(ix1 === -1) {
        return '';
    }

    ix2 = context.indexOf('<', ix1 + keyname.length);

    ix3 = context.indexOf('>', ix2);
    let theNextKey = context.slice(ix2 , ix3 + 1);
    let isData = false;
    
    switch(theNextKey) {
        case '<array/>':
            return '';
            break;
        case '<dict/>':
            return '';
            break;
        case '<true/>':
            return true;
            break;
        case '<false/>':
            return false;
            break;
        case '<data>':
            isData = true;
            break;
    }

    //找到最近的匹配的对, 返回其中的值

    let js = 1, charkey = '', nextsetp = ix3;
    theNextKey = theNextKey.substr(1);
    let ntl = theNextKey.length;
    while(js > 0) {
        ix1 = context.indexOf(theNextKey, nextsetp);
        nextsetp = ix1 + ntl;
        charkey = context.substr(ix1 - 1, 1);
        switch(charkey) {
            case '/':
                js --;
                break;
            case '<':
                js ++;
                break;
        }
    }
    let rstring = context.slice(ix3 + 1, ix1 - 2);
    if(isData === true && rstring !== '') {
        rstring = base64toHex(rstring);        
    }

    
    return rstring;
}

//去除 换行 tab 回车 两边空格
function formatContext(context) {
	context = context.replace(/[\t\r]/g,'');
	let arrayContext = context.split('\n');
	let newContext = '';
	for(let i=0;i<arrayContext.length;i++) {
		//console.log(arrayContext[i].trim());
		newContext += arrayContext[i].trim();
	}
    //context = context.replace(/[\t\r\n]/g,'');
    return newContext;
}

//base64转16进制
function base64toHex(strbase64) {

    function dec2hex(d) {
        let hD='0123456789ABCDEF';
        let h = hD.substr(d&15,1);
        while (d>15) {
            d>>=4;
            h=hD.substr(d&15,1)+h;
        }            
        return h;
    }


    function base64_decode(input) {   

        let keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        let output = new Array();
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;

        let orig_input = input;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        if (orig_input != input)
            showTipModal ("Warning! Characters outside Base64 range in input string ignored.");
        if (input.length % 4) {
            showTipModal ("Error: Input length is not a multiple of 4 bytes.");
            return "";
        }
        
        let j=0;
        while (i < input.length) {

            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            
            output[j++] = chr1;
            if (enc3 != 64)
              output[j++] = chr2;
            if (enc4 != 64)
              output[j++] = chr3;
              
        }
        return output;
    }



    let output = base64_decode(strbase64);
    let hexText = '';
    for (i=0; i<output.length; i++) {
      hexText = hexText + (output[i]<16?"0":"") + dec2hex(output[i]);          
    }
    return hexText;
}

//16进制转base64
function hextoBase64(strhex) {

    function binary_to_base64(input) {
        let base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
        let ret = new Array();
        let i = 0;
        let j = 0;
        let char_array_3 = new Array(3);
        let char_array_4 = new Array(4);
        let in_len = input.length;
        let pos = 0;

        while (in_len--) {
            char_array_3[i++] = input[pos++];
            if (i == 3) {
                char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
                char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
                char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
                char_array_4[3] = char_array_3[2] & 0x3f;

                for (i = 0; (i <4) ; i++)
                    ret += base64_chars.charAt(char_array_4[i]);
                i = 0;
            }
        }

        if (i) {
            for (j = i; j < 3; j++)
                char_array_3[j] = 0;

            char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
            char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
            char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
            char_array_4[3] = char_array_3[2] & 0x3f;

            for (j = 0; (j < i + 1); j++)
                ret += base64_chars.charAt(char_array_4[j]);

            while ((i++ < 3))
                ret += '=';

        }

        return ret;
    }
    
    if (strhex.length % 2) {
        showTipModal ("Error: cleaned hex string length is odd.");           
        return '';
    }
    let binary = new Array();
    for (let i=0; i<strhex.length/2; i++) {
        let h = strhex.substr(i*2, 2);
        binary[i] = parseInt(h,16);        
    }
    return binary_to_base64(binary);
} 


function toBoolString(strbool) {
    if(strbool === '1' || strbool === 'true') {
       return '<true/>';
    } else {
        return '<false/>';
    }
}

function toBoolStringStrict(strbool) {
    if(strbool === true) {
        return '<true/>';
    } else {
        return '<false/>';
    }
}




function toNumber(num) {
    if(isNaN(num)) {
        showTipModal(PAGE_TITLE.lang.toNumberError);
        return 0;
    } else {
        return Number(num);
    }
}

function addCharstring(str) {
    if(str === undefined) {
        return '';
    } else {        
        return '<string>' + str.trim() + '</string>';
    }
    
}

//复制内容到剪贴板中
function copyDatatoClipboard(rowdata) {
	$("body").append('<div id="hiddendivforcopy"><button id="hiddenbuttonforcopy">Copy</button></div>');
	let clipboard  = new ClipboardJS('#hiddenbuttonforcopy', {
        text: function() {
            return rowdata;
        }
    });
	//自动点击copy
	$("#hiddenbuttonforcopy").trigger("click");
	//删除
	clipboard.destroy();
	
	$("#hiddendivforcopy").remove();
}


function showTipModal(content) {
	alert(content);
}

function showTextareaModal(content) {

	VUEAPP.textarea_content = '';
	$('#inputModal').modal('show');
	$('#inputModal').on('shown.bs.modal', function () {
       $("#inputModal #textarea_plist_paste").focus();//获取焦点
  	});

}

function stringToJSON(str) {
	let objreturn;
	try {
		objreturn = JSON.parse(str);
	} catch (e) {
		return false;
	}
	return objreturn;
}