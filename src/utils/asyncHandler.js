//utility wrapper for async await, try catch | req while comms with DB

// const asyncHandler = (fn) => async(req, res, next) => {
//     try{
//         await fn(req, res, next)
//     }catch(error){
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((error)=>next(error))
    }
}
export {asyncHandler}