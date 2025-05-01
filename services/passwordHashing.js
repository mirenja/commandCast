import bcrypt from 'bcrypt'

const saltRounds = 12

export async function generatedSalt(){
    try{
        const salt = await bcrypt.genSalt(saltRounds)
        return salt
    }catch(error){
        console.error(error)
        throw console.error(error)
    }}


export async function hashPassword(userPassword, salt){
    try{
        const hashedPassword = await bcrypt.hash(userPassword,salt)
        return hashedPassword
    }
    catch(error){
        console.error(error)
        throw error
    }
 
}

export async function comparePassword(password, storedHash) {
    try {
        const isMatch = await bcrypt.compare(password, storedHash)
        return isMatch
    } catch (error) {
        throw error
    }
}