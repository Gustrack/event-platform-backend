import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  last_name: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres']
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  versionKey: false
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.password;
    return returnedObject;
  }
});

export default mongoose.model('User', userSchema);
