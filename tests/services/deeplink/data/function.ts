
function gidentity_code(): string{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 11; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
export {gidentity_code}



function purpose_of_transaction(): string{
     let code = '';
    for (let i = 0; i < 11; i++) {
        code += Math.floor(Math.random() * 10); // random number 0-9
    }
    return code;
}
export {purpose_of_transaction}

function gcustomer_code(): string{
     let code = 'CS';
    for (let i = 0; i < 11; i++) {
        code += Math.floor(Math.random() * 10); // random number 0-9
    }
    return code;
}
export {gcustomer_code}

function gCustomerName(): string {
  const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Hannah', 'Ian', 'Jane','doe','smith','johnson','williams','brown','jones','garcia','miller','davis'];
    return names[Math.floor(Math.random() * names.length)];
}
export { gCustomerName };
