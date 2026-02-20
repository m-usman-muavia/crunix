const DashboardImage = require('../models/dashboardimage');
const { uploadBuffer, deleteByPublicId } = require('../config/cloudinary');

const getDashboardImages = async (req, res) => {
  try {
    let doc = await DashboardImage.findOne().lean();

    if (!doc) {
      doc = { images: [] };
    }

    return res.status(200).json({
      success: true,
      data: {
        images: doc.images || [],
        total: (doc.images || []).length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const addDashboardImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    const uploadResult = await uploadBuffer(req.file.buffer, {
      folder: 'dashboard'
    });

    let doc = await DashboardImage.findOne();
    if (!doc) {
      doc = new DashboardImage({ images: [] });
    }

    doc.images.push({
      image_path: uploadResult.secure_url || '',
      image_public_id: uploadResult.public_id || ''
    });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: 'Image added successfully',
      data: {
        images: doc.images,
        total: doc.images.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const deleteDashboardImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const doc = await DashboardImage.findOne();
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'No images found'
      });
    }

    const imageIndex = doc.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const imageToDelete = doc.images[imageIndex];
    if (imageToDelete.image_public_id) {
      await deleteByPublicId(imageToDelete.image_public_id);
    }

    doc.images.splice(imageIndex, 1);
    await doc.save();

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        images: doc.images,
        total: doc.images.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardImages,
  addDashboardImage,
  deleteDashboardImage
};
