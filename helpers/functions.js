var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
const fs = require('fs')

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(len) {
    var buf = []
        , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        , charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
}

function encrypt(encrypt_string, callback) {
  bcrypt.genSalt(5, function (err, salt) {
      if (err)
          return callback(err);
      bcrypt.hash(encrypt_string, salt, null, function (err, hash) {
          if (err) {
              callback({ "code": 100, "status": "Error in password encrypt" });
          }
          callback({"code": 1, "hash": hash});
      });
  });
}

function encrypt_method2(text, secret) {
    var cipher = crypto.createCipher(algorithm, secret)
    var crypted = cipher.update(text + secret, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt_method2(text, secret) {
  var decipher = crypto.createDecipher(algorithm, secret)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec.split(secret)[0];
}

function convert_type_to_field(type) {
  var ret_type = "";
  switch (type) {
    case "text":
      ret_type = "VARCHAR";
      break;
    case "decimal":
      ret_type = "DECIMAL";
      break;
    case "number":
      ret_type = "INT";
      break;
    case "boolean":
      ret_type = "TINYINT";
      break;
    case "email":
      ret_type = "VARCHAR";
      break;
    case "dni":
      ret_type = "VARCHAR";
      break;
    case "phone":
      ret_type = "VARCHAR";
      break;
    case "select":
      ret_type = "INT";
      break;
    case "input":
      ret_type = "INT";
      break;
    case "checklist":
      ret_type = "INT";
      break;
    case "radio":
      ret_type = "INT";
      break;
    case "foreignRow":
      ret_type = "INT";
      break;
    case "date":
      ret_type = "DATE";
      break;
    case "dateTime":
      ret_type = "DATETIME";
      break;
    case "textarea":
      ret_type = "VARCHAR";
      break;
    default:
      ret_type = type;
      break;
  }
  return ret_type;
}

function replace_spaces(str_space) {
  //return str_space.replace(" ", "_");
  return str_space.replace(/ /g, "_");
}

function timeToDecimal(t) {
    var arr = t.split(':');
    var dec = parseInt((arr[1]/6)*10, 10);

    return parseFloat(parseInt(arr[0], 10) + '.' + (dec<10?'0':'') + dec);
}

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

function round2Decimals(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

function removeFile(path) {
  try {
    fs.unlinkSync(__dirname + "/../uploads/" + path)
    //file removed
  } catch(err) {
    console.error(err)
  }
}

function parseFiles(files) {
  var filesRet = [];
  console.log("parsing files....")
  console.log(files)
  for(var value in files.files) {
    console.log(files.files[value][0])
      var fieldname = files.files[value][0].fieldname;
      var filename = files.files[value][0].filename;
      var string_key = fieldname;
      var string_value =  fieldname + "/" + filename;
      filesRet.push({key: string_key, value: string_value})
  }
   return filesRet;   
}

function insertArrayAtPosition(array, index, item) {
  array.splice(index, 0, item);
}

function clone(obj) {
  const clone = JSON.parse(JSON.stringify(obj));
  return clone;
}

exports.unescapeRecursive = unescapeRecursive;
function unescapeRecursive(input) {
	// Null or undefined, just return input
	if (typeof input === 'undefined' || input === null) {
		return input;
	}

	var output;
	var i;
	var type = typeof input;

	if (input instanceof Array) {
		output = [];
		for (i = 0; i < input.length; i++) {
			output[i] = unescapeRecursive(input[i]);
		}
	} else if (type === 'object') {
		output = {};
		for (i in input) {
			output[i] = unescapeRecursive(input[i]);
		}
	} else if (type === 'string') {
    output = unescape(input);
	} else {
		output = input;
	}

	return output;
};

exports.getRandomInt = getRandomInt;
exports.uid = uid;
exports.encrypt = encrypt;
exports.encrypt_method2 = encrypt_method2;
exports.decrypt_method2 = decrypt_method2;
exports.convert_type_to_field = convert_type_to_field;
exports.replace_spaces = replace_spaces;
exports.timeToDecimal = timeToDecimal;
exports.isEmptyObject = isEmptyObject;
exports.round2Decimals = round2Decimals;
exports.removeFile = removeFile;
exports.parseFiles = parseFiles;
exports.insertArrayAtPosition = insertArrayAtPosition;
exports.clone = clone;