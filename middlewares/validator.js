const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const { countryList } = require('./countryList');

exports.registerValidator = [
    body('email', 'Email is not in a right form').isEmail(),
    body('password', 'Password will be minimum 5 chars').isLength({ min: 5 }),
    body('country', 'Country is required').isIn( countryList ),
    body('username', 'Username will be name and surname ').matches(/^[A-Za-z]+\s*[A-Za-z]+$/g), // ???
    valErrorHandler,
]

exports.loginValidator = [
    body('email').trim().isEmail().withMessage('email / password is required!'),
    body('password')
      .trim()
      .not()
      .isEmpty()
      .withMessage('email / password is required!'),
      valErrorHandler
  ];

  function valErrorHandler(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }

  function checkCountries(req, res, next) {
    const countries = req.body.allowedCountries.split(',');
    console.log('countries', countries);
    for(let i = 0; i < countries.length; i++) {
        if(!countryList.includes(countries[i])) {
            console.log('country not found', countries[i]);
            return res.status(422).json({ errors: [{ msg: 'Invalid country!' }] });
        }
        }
        next();
  }

  exports.ticketValidator = [
    body('name', 'Name is required').isLength({ min: 5 }),
    body('description', 'Description is required').isLength({ min: 5 }),
    body('price', 'Minimum price will be 100 coins').isNumeric().isInt({ min: 100 }),
    checkCountries,
    body('eventDate', 'Date format is ****-**-**').isISO8601(),
    body('cancelDate', 'Date format is ****-**-**').isISO8601(),
    body('quantity', 'Quantity is required').isNumeric().isInt({ min: 1 }),
    body('canCancel', 'Can cancel is required').isBoolean(),
    valErrorHandler
  ]

  