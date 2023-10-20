import { Profile } from "../models/profile.js"
import { CoffeeShop } from "../models/coffeeShop.js"
import { Club } from "../models/club.js"

async function index(req, res) {
  try {
    const shops = await CoffeeShop.find({}).populate('addedBy')
    res.status(200).json(shops)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function create(req, res) {
  try {
    req.body.addedBy = req.user.profile
    req.body.location = req.body.address.city
    const shop = await CoffeeShop.create(req.body)
    const profile = await Profile.findByIdAndUpdate(req.user.profile,
      { $push: { coffeeShops: shop } }, { new: true })
    shop.addedBy = profile
    res.status(201).json(shop)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function show(req, res) {
  try {
    const selectedShop = await CoffeeShop.findById(req.params.coffeeShopId)
      .populate([{path:'addedBy'}, {path:'clubs'}, {path:'reviews.addedBy'}])
    res.status(200).json(selectedShop)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}


async function update(req, res) {
  try {
    req.body.location = req.body.address.city
    const selectedShop = await CoffeeShop.findByIdAndUpdate(
      req.params.coffeeShopId, req.body, { new: true }
    ).populate('addedBy')
    res.status(201).json(selectedShop)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function deleteShop(req, res) {
  try {
    const selectedShop = await CoffeeShop.findByIdAndDelete(req.params.coffeeShopId)
    const profile = await Profile.findById(req.user.profile)
    profile.coffeeShops.remove({ _id: req.params.coffeeShopId })
    await profile.save()
    res.status(200).json(selectedShop)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function createReview(req, res) {
  try {
    req.body.addedBy = req.user.profile
    const selectedShop = await CoffeeShop.findById(req.params.coffeeShopId)
    selectedShop.reviews.push(req.body)
    await selectedShop.save()
  
    const newReview = selectedShop.reviews[selectedShop.reviews.length - 1]
  
    const profile = await Profile.findById(req.user.profile)
    newReview.addedBy = profile
    res.status(201).json(newReview)
  } catch (error) {
    console.log(error);

    res.status(500).json(error)
  }
}

async function updateReview(req, res) {
  try {
    const selectedShop = await CoffeeShop.findById(req.params.coffeeShopId)
    const selectedReview = selectedShop.reviews.id(req.params.reviewId)
    selectedReview.set(req.body)
    await selectedShop.save()
    res.status(201).json(selectedReview)
  } catch (error) {
    res.status(500).json(error)
  }
}

async function deleteReview(req, res) {
  try {
    const selectedShop = await CoffeeShop.findById(req.params.coffeeShopId)
    const selectedReview = selectedShop.reviews.id(req.params.reviewId)
    selectedShop.reviews.remove(selectedReview)
    await selectedShop.save()
    res.status(200).json(selectedReview)
  } catch (error) {
    res.status(500).json(error)
  }
}

async function addClubToShop(req,res) {
  try {
    const selectedShop = await CoffeeShop.findById(req.params.coffeeShopId)
    const selectedClub = await Club.findById(req.params.clubId)
    selectedShop.clubs.push(selectedClub)
    await selectedShop.save()
    res.status(200).json(selectedShop)
  } catch (error) {
    res.status(500).json(error)
  }
}

export {
  index, create, show, update, deleteShop, createReview, updateReview, deleteReview, addClubToShop
}