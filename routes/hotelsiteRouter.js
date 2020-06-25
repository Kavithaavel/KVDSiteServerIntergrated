const express = require("express");
const Hotelsite = require("../models/hotelsite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const hotelsiteRouter = express.Router();

hotelsiteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Hotelsite.find(req.query)
      .populate("comments.author")
      .then((hotelsites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(hotelsites);
      })
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Hotelsite.create(req.body)
        .then((hotelsite) => {
          console.log("Hotelsite Created ", hotelsite);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(hotelsite);
        })
        .catch((err) => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end("PUT operation not supported on /hotelsites");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Hotelsite.deleteMany()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

hotelsiteRouter
  .route("/:hotelsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Hotelsite.findById(req.params.hotelsiteId)
      .populate("comments.author")
      .then((hotelsite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(hotelsite);
      })
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end(
        `POST operation not supported on /hotelsites/${req.params.hotelsiteId}`
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Hotelsite.findByIdAndUpdate(
        req.params.hotelsiteId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then((hotelsite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(hotelsite);
        })
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Hotelsite.findByIdAndDelete(req.params.hotelsiteId)
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

//For Comments

hotelsiteRouter
  .route("/:hotelsiteId/comments")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Hotelsite.findById(req.params.hotelsiteId)
      .populate("comments.author")
      .then((hotelsite) => {
        if (hotelsite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(hotelsite.comments);
        } else {
          err = new Error(`Hotelsite ${req.params.hotelsiteId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Hotelsite.findById(req.params.hotelsiteId)
        .then((hotelsite) => {
          if (hotelsite) {
            req.body.author = req.user._id;
            hotelsite.comments.push(req.body);
            hotelsite
              .save()
              .then((hotelsite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(hotelsite);
              })
              .catch((err) => next(err));
          } else {
            err = new Error(`Hotelsite ${req.params.hotelsiteId} not found`);
            err.status = 404;
            return next(err);
          }
        })
        .catch((err) => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(
        `PUT operation not supported on /hotelsites/${req.params.hotelsiteId}/comments`
      );
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Hotelsite.findById(req.params.hotelsiteId)
        .then((hotelsite) => {
          if (hotelsite) {
            for (let i = hotelsite.comments.length - 1; i >= 0; i--) {
              hotelsite.comments.id(hotelsite.comments[i]._id).remove();
            }
            hotelsite
              .save()
              .then((hotelsite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(hotelsite);
              })
              .catch((err) => next(err));
          } else {
            err = new Error(`Hotelsite ${req.params.hotelsiteId} not found`);
            err.status = 404;
            return next(err);
          }
        })
        .catch((err) => next(err));
    }
  );

hotelsiteRouter
  .route("/:hotelsiteId/comments/:commentId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Hotelsite.findById(req.params.hotelsiteId)
      .populate("comments.author")
      .then((hotelsite) => {
        if (hotelsite && hotelsite.comments.id(req.params.commentId)) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(hotelsite.comments.id(req.params.commentId));
        } else if (!hotelsite) {
          err = new Error(`Hotelsite ${req.params.hotelsiteId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(
        `POST operation not supported on /hotelsites/${req.params.hotelsiteId}/comments/${req.params.commentId}`
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Hotelsite.findById(req.params.hotelsiteId)
        .then((hotelsite) => {
          if (hotelsite && hotelsite.comments.id(req.params.commentId)) {
            if (
              hotelsite.comments
                .id(req.params.commentId)
                .author._id.equals(req.user._id)
            ) {
              if (req.body.rating) {
                hotelsite.comments.id(req.params.commentId).rating =
                  req.body.rating;
              }
              if (req.body.text) {
                hotelsite.comments.id(req.params.commentId).text =
                  req.body.text;
              }
              hotelsite
                .save()
                .then((hotelsite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(hotelsite);
                })
                .catch((err) => next(err));
            } else {
              err = new Error("You are not authorized to delete this comment!");
              err.status = 403;
              return next(err);
            }
          } else if (!hotelsite) {
            err = new Error(`Hotelsite ${req.params.hotelsiteId} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        })
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Hotelsite.findById(req.params.hotelsiteId)
        .then((hotelsite) => {
          if (hotelsite && hotelsite.comments.id(req.params.commentId)) {
            if (
              hotelsite.comments
                .id(req.params.commentId)
                .author._id.equals(req.user._id)
            ) {
              hotelsite.comments.id(req.params.commentId).remove();
              hotelsite
                .save()
                .then((hotelsite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(hotelsite);
                })
                .catch((err) => next(err));
            } else {
              err = new Error("You are not authorized to delete this comment!");
              err.status = 403;
              return next(err);
            }
          } else if (!hotelsite) {
            err = new Error(`Hotelsite ${req.params.hotelsiteId} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        })
        .catch((err) => next(err));
    }
  );

module.exports = hotelsiteRouter;
