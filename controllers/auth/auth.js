exports.registeruser = async(req,res,next)=>{
  if(req.session.user){
    res.redirect('/')
  }
  if(req.method == 'POST'){
    const{username,email,phone,password,repassword,role} = req.body;
    if (email == "" || username == "" || phone == ""||password==""||repassword=="") {
      req.flash('error','empty values cannot be submited');
      return res.redirect('/register');
    }
    if(password != repassword){
      req.flash('error', 'Password should match');
      return res.redirect('/register');
    }
    const user = await User.findOne({phone:phone});
    if(user){
      req.flash('error', 'Phone already exists');
      return res.redirect('/register');
    }
    User.findOne({email:email})
    .then(userDocs=>{
      if(userDocs){
        req.flash('error', 'Email already exists');
        return res.redirect('/register');
      }
      const otp = Math.floor(1000 + Math.random() * 9000);
      const user = new User({username:username,email:email,password:password,phone:phone,role:role,otp:otp});
      return user.save()
      .then(newuser=>{
        req.flash('success', 'Registration successfull. Welcome to writtershub, please activate your account we have sent an email with an otp');
        return res.redirect('/otp');
      });
    })
    .catch(error=>{
      console.log(error);
      req.flash('error', 'Error occured plese contact admin');
      return res.redirect('/register');
    });
  }else{
    res.render('signup',{message:req.flash('error')})
  }
};


exports.activateUser = async(req,res,next)=>{
  if(req.method == 'POST'){
    const {otp}=req.body;
    if(otp == ""){
      req.flash('error', 'empty values cannot be accepted')
      return res.redirect('/otp')
    }
    const id = req.session.user.id
    const user = await User.findOne({id})
    if(otp != user.id){
      req.flash('error', 'Activation code is invalid')
      return res.redirect('/otp')
    }
    user.is_active = true
    try {
      await user.save()
      return res.redirect('/dashboard')
    } catch (error) {
      console.log(error);
      req.flash('error','Internal server error please contact the admin')
      return res.redirect('/otp')
    }
  }
  res.render('otp',{successmessage:req.flash('success'),errormessage:req.flash('error')})
}

exports.loginuser = async(req,res,next)=>{
  if(req.session.user){
    console.log(req.session.user);
    return res.redirect('/')
  }
  if(req.method == 'POST'){
    if (req.body.email == "" || req.body.password == "") {
      req.flash('error','empty values cannot be submited');
      return res.redirect('/login');
    }
    const{email, password} = req.body;
    const existinguser = await User.findOne({email});
    if(!existinguser){
      req.flash('error', 'User does not exist');
      return res.redirect('/register')
    }
    const matchpassword = await  Password.compare(existinguser.password, password);
    if(!matchpassword){
      req.flash('error', 'Wrong password');
      return res.redirect('/login')
    }
    if(!existinguser.verified){
      req.flash('error', 'User is not verified');
      return res.redirect('/login')
    }
      req.session.user = existinguser;
      req.session.is_loggedin=true;
      return res.redirect('/')
  }else{
    res.render('login', {successmessage:req.flash('success'),errormessage:req.flash('error')})
  }
  
};


exports.logout=(req,res,next)=>{
  req.session.destroy(function(err) {
    if(err) {
        return next(err);
    } else {
        req.session = null;
        console.log(req.session);
        console.log("logout successful");
        return res.redirect('/');
    }
});
};

exports.forgotpass = async (req,res,next)=>{
  if(req.session.user){
    res.redirect('/')
  }
  if(req.method == 'POST'){
    if (req.body.email == "") {
      req.flash('error','empty values cannot be submited');
      return res.redirect('/forgotpassword');
    }
    const user = await User.findOne({email:req.body.email});
    if(!user){
      req.flash('error', 'User does not exist');
      return res.redirect('/register');
    }

    const resetToken = user.getResetPasswordToken();
    console.log(resetToken);
    const reseturl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;
    const message  = `You are receiving this email because you (or someone else) has requested a reset of password. Please click this link ${reseturl}`;
    const subj = "Password Renewal";
    try {
      await sendMail(user.username,user.email,subj,message);
      req.flash('success' , 'Instructiions were sent to your email');
      res.redirect('/forgotpassword');
    } catch (error) {
      console.log(error);
      user.resetPasswordToken = undefined;
      user.resetPassworExpire = undefined;
      await user.save({validateBeforeSave: false});
      req.flash('error' , 'something went wrong');
      res.redirect('/forgotpassword');
    }
    await user.save(
      {
        validateBeforeSave: false
      }
    );
  }else{
    
    res.render('forgotpass',{successmessage:req.flash('success'),errormessage:req.flash('error')});
  }
  
};

exports.resetPassword = async (req,res,next)=>{
  // get hashed token
  const resetpassToken  = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
  console.log(resetpassToken);
  const user = await User.findOne({
    resetPasswordToken : resetpassToken,
  });

console.log(user);
  if(!user){
    req.flash('error', 'User does not exist');
    return res.redirect('/login')
  }
  if(req.method == 'POST'){
    if (req.body.password == "") {
      req.flash('error','empty values cannot be submited');
      return res.redirect('/login');
    }
    // set new pass
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPassworExpire= undefined;
    await user.save();
    req.session.user = user;
    req.session.is_loggedin = true
    req.flash('success', 'Password reset');
    res.redirect('/')
  }else{
    res.render('restpass',{successmessage:req.flash('success'),errormessage:req.flash('error')})
  }
};
