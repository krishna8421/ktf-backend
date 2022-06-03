import { newAmount } from "@utils";
import { Router } from "express";
import { User, Event, Merch } from "@models";
import { COUPON_DISCOUNT } from "@constants";

const router = Router();

router.post("/", async (req, res) => {
  const {
    currentUser: { uid },
    eventID,
    merchID,
    merchSize = "M",
    quantity = 1,
  } = req.body;

  if (!eventID && !merchID) {
    return res.status(400).send({
      message: "Please provide event or merch ID",
    });
  }

  let event;
  let merch;
  let newEvent;
  let newMerch;
  const user = await User.findOne({ uid }, "cart -_id");

  const { cart: { items = [], couponApplied = false } = {} } = user;

  // If event is provided
  if (eventID) {
    event = await Event.findOne({ eventID });
    if (!event) {
      return res.status(500).send({
        message: "Invalid EventID",
      });
    }
    const { name, eventDate, price, imageUrl } = event;
    newEvent = {
      name,
      eventDate,
      price,
      imageUrl,
      type: "event",
      id: eventID,
      added_on: new Date(),
    };
    let alreadyInCart = false;
    items.map((item: any) => {
      if (item.id === eventID) {
        alreadyInCart = true;
      }
    });
    if (alreadyInCart) {
      return res.status(400).send({
        message: "Event already in the cart",
      });
    }

    const newItems = [...(items || []), newEvent];

    const newCart = {
      couponApplied,
      amount: newAmount(newItems, couponApplied),
      items: newItems,
    };

    await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          cart: newCart,
        },
      },
    );
    return res.json({
      message: "Event added to cart",
    });
  }

  // If merch is provided
  if (merchID) {
    // if(!merchSize) {
    //   return res.status(400).send({
    //     message: "Please provide merch size",
    //   });
    // }
    // if(!quantity){
    //   return res.status(400).send({
    //     message: "Please provide quantity",
    //   });
    // }
    merch = await Merch.findOne({ merchID });
    if (!merch) {
      return res.status(500).send({
        message: "Invalid merchID",
      });
    }
    const { name, price, imageUrl } = merch;
    newMerch = {
      name,
      price,
      imageUrl,
      type: "merch",
      id: merchID,
      added_on: new Date(),
      merchSize,
      quantity,
    };
    let alreadyInCart = false;
    // let itemInIndex = 0;

    items.map((item: any, i: number) => {
      if (item.id === merchID) {
        alreadyInCart = true;
        // itemInIndex = i;
      }
    });

    let newItems = [];
    // if (!alreadyInCart) {
    newItems = [...(items || []), newMerch];
    // } else {
    //   newItems = [...items];
    //   newItems[itemInIndex].quantity = quantity;
    // }
    if (alreadyInCart) {
      return res.status(400).send({
        message: "Merch already in the cart",
      });
    }

    let newAmount: number = newItems.reduce((acc, item) => acc + item.price, 0);

    if (couponApplied) {
      newAmount = parseInt((newAmount * COUPON_DISCOUNT).toFixed(0));
    }

    const newCart = {
      couponApplied,
      amount: newAmount,
      items: newItems,
    };

    await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          cart: newCart,
        },
      },
    );
    return res.json({
      message: "Merch added to cart",
    });
  }
});

export default router;
