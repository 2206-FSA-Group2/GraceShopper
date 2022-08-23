const client = require("./client");

async function createReview({
  user_id,
  product_id,
  rating,
  title,
  description,
}) {
  try {
    const {
      rows: [product],
    } = await client.query(
      `
              INSERT into reviews(user_id, product_id, rating, title, description)
              VALUES($1, $2, $3, $4, $5)
              RETURNING *;
              `,
      [user_id, product_id, rating, title, description]
    );
    return product;
  } catch (error) {
    console.error(error);
  }
}

async function getAllReviews() {
  try {
    const { rows } = await client.query(
      `
            SELECT *
            FROM reviews
          `
    );
    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function getReviewsByProductId(id) {
  try {
    const { rows } = await client.query(
      `
          SELECT *   
          FROM reviews
          WHERE product_id=$1;
          `,
      [id]
    );
    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function getReviewsByUserId(id) {
  try {
    const { rows } = await client.query(
      `
          SELECT *   
          FROM reviews
          WHERE user_id=$1;
          `,
      [id]
    );
    return rows;
  } catch (error) {
    console.error(error);
  }
}

async function destroyReview(id) {
  try {
    const {
      rows: [review],
    } = await client.query(
      `
        DELETE FROM reviews
        WHERE id=$1
        RETURNING *;
      `,
      [id]
    );
    return review;
  } catch (error) {
    console.error(error);
  }
}

async function createInitialReviews() {
  console.log("Starting to create reviews...");
  try {
    const reviewsToCreate = [
      {
        user_id: 1,
        product_id: 1,
        rating: 5,
        title: "My first review",
        description: "Great product!",
      },
      {
        user_id: 2,
        product_id: 1,
        rating: 4,
        title: "Not a review",
        description: "Not so good",
      },
      {
        user_id: 2,
        product_id: 2,
        rating: 1,
        title: "Worst product ever",
        description: "DO NOT BUY",
      },
    ];
    const reviews = await Promise.all(reviewsToCreate.map(createReview));

    console.log("Reviews created:");
    console.log(reviews);
    console.log("Finished creating reviews!");
  } catch (error) {
    console.error("Error creating reviews!");
    throw error;
  }
}

module.exports = {
  createReview,
  createInitialReviews,
  getAllReviews,
  destroyReview,
  getReviewsByProductId,
  getReviewsByUserId,
};
