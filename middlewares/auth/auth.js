const RequireAuth = (req,res,next)=>{
  if (!req.session.user || !req.session.user.is_active){
    return res.redirect('/login')
  }
  next();
};
const RequireActive = (req,res,next)=>{
  if (!req.session.user.is_active){
    return res.redirect('/login')
  }
  next();
}

module.exports = {RequireAuth,RequireActive};