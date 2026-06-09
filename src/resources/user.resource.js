// src/resources/user.resource.js

const userResource = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  referral_code: user.referral_code,
  friends_code: user.friends_code,
  reward_points: user.reward_points,
  profile_image: user.profile_image,
  status: user.status,
  country: user.country,
  iso_2: user.iso_2,
  access_panel: user.access_panel,
  created_at: user.createdAt,
});

module.exports = userResource;