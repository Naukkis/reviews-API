// format 20181224 to 2018-12-24
function formatDate(date){
    let formattedDate = date.slice(0,4);
    formattedDate += "-" + date.slice(4,6);
    formattedDate += "-" + date.slice(6,8);
    return formattedDate;
}

module.exports = {
    formatDate
}