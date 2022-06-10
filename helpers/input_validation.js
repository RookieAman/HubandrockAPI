var ValidateSpanishID = require('./inputValidators/nifNie');
var ValidateDate = require('./inputValidators/date');
var functions = require('./functions')

const codeIsNull = 103;
const codeShort = 104;
const codeLong = 105;
const codeIsNotNum = 106;
const codeIsNotDniNieCif = 107;
const codeIsNotEmail = 108;
const codeIsNotDate = 109;
const codeIsNotBool = 110;

const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const arrayParamRegexp = /^[a-zA-Z\_]*\[[0-9]+\]$/;


exports.fillValidators = function(validators, params) {
    for(var it in validators) {
        if(typeof validators[it].type !== 'undefined' 
            && validators[it].type == 'array_values') {
            for(const [key, value] of Object.entries(params)) {
                var key_name = validators[it].key_name;
                
                //console.log(params[param_count])
                if(key.includes(key_name+"_")) {
                    for(var i in value) {
                        if(typeof validators[it].values[i] === 'undefined') {
                            
                            functions.insertArrayAtPosition(validators[it].values, i, functions.clone(validators[it].validator));                                
                        }
                        var actualValidator = validators[it].values[i];
                        for(it2 in actualValidator) {
                            if(actualValidator[it2].name == key) {
                                actualValidator[it2].value = value[i];
                            }
                        }
                    }
                }
            }      
        }
        else {
            validators[it].value = params[validators[it].name];
        }
    }
    console.log(validators)
    return validators
}

exports.validateParams = function(params) {
    var validParams = {valid: true, errors: []};
    for(var filter in params) {
        var res = validateParam(params[filter]);
        if(!res.valid) {
            validParams.valid = false;
            var paramerrors = {name: params[filter].name, errors: res.errors}
            validParams.errors.push(paramerrors)
        }
    }
    return validParams;
}

exports.validateParam = validateParam;
function validateParam(param) {
    var name = param.name;
    var value = (param.value) ? param.value : null;
    var filters = param.filters;
    var validation = {valid: true, errors: []}
    if(typeof param.type !== 'undefined' && param.type == 'array_values') {
        console.log("begin...")
        console.log(param.values)
        
        for(var i in param.values[0]) {
            var validationsub = validateParam(param.values[0][i])
            
            
            if(!validationsub.valid) {
                validation.valid = false;
                validation.errors.push({name: param.values[0][i].name, errors: validationsub.errors})
            }
            console.log(validation)
        }
    }
    else {
        for(var filterKey in filters) {
            var filter = filters[filterKey]
            if(filter.name == "notNull") { //condition
                if(value == null) {
                    validation.valid = false;
                    validation.errors.push({name: filter.name, code: codeIsNull, msg: "Can not be null" })
                }
            }
            if(filter.name == "minLength") {
                if(value != null && value.length < filter.value) { //condition
                    validation.valid = false;
                    validation.errors.push({name: filter.name, code: codeShort, msg: "Too short", value: filter.value })
                }
            }
            if(filter.name == "maxLength") {
                if(value != null && value.length > filter.value) { //condition
                    validation.valid = false;
                    validation.errors.push({name: filter.name, code: codeLong, msg: "Too long", value: filter.value })
                }
            }
            if(filter.name == "isNumber") {
                value = Number(value)
                if(value != null && isNaN(value)) { //condition
                    validation.valid = false;
                    validation.errors.push({name: filter.name, code: codeIsNotNum, msg: "Is not number" })
                }
            }
            if(filter.name == "isDniNieCif") {
                if(value != null && !ValidateSpanishID.ValidateSpanishID(value)) { //condition
                    validation.valid = false;
                    validation.errors.push({name: filter.name, code: codeIsNotDniNieCif, msg: "Is not DNI/NIE/CIF" })
                }
            }
            if(filter.name == "isDate") {
                if(value != null && !ValidateDate.isValidDate(value)) { //condition
                    validation.valid = false;
                    validation.errors.push({name: filter.name, code: codeIsNotDate, msg: "Is not a date" })
                }
            }
            if(filter.name == "isEmail") {
                if(value != null && !emailRegexp.test(value)) { //condition
                    validation.valid = false;
                    validation.errors.push({name: filter.name, code: codeIsNotEmail, msg: "Is not email" })
                }
            }

            if(filter.name == "isBool") {
                if(value != null && (value != "1" && value != "0")) { //condition
                    validation.valid = false;
                    validation.errors.push({name: filter.name, code: codeIsNotBool, msg: "Is not boolean" })
                }
            }
        }
    }
    console.log(param.name + " final:")
    console.log(validation)
    return validation;
}

