class UserDTO {
  static format(user) {
    return {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      company: user.company || null,
      specialty: user.specialty || null,
      phone: user.phone || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static formatList(users) {
    return users.map((user) => this.format(user));
  }
}

module.exports = UserDTO;
