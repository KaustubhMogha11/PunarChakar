import Joi from 'joi';

const baseSchema = Joi.object({
    company: Joi.string().allow('', null),
    mobile: Joi.string().pattern(/^\d{10}$/).required(),
    email: Joi.string().email().required(),
    material: Joi.string().valid('battery_scrap', 'second_life', 'blackmass').required(),
    quantity: Joi.number().positive().required(),
    enquiry: Joi.string().allow('', null)
});

const schemas = {
    battery_scrap: baseSchema.keys({
        battery_type: Joi.string().valid('LCO-S', 'NMC-S', 'LFP-S').required()
    }),
    second_life: baseSchema.keys({
        second_life_type: Joi.string().valid('LCO-I', 'NMC-I', 'LFP-I').required(),
        voltage: Joi.number().positive().required(),
        capacity: Joi.number().positive().required()
    }),
    blackmass: baseSchema.keys({
        blackmass_type: Joi.string().valid('LCO-B', 'NMC-B', 'LFP-B').required(),
        li_percent: Joi.number().min(0).max(100).required(),
        co_percent: Joi.number().min(0).max(100).required(),
        ni_percent: Joi.number().min(0).max(100).required(),
        cu_percent: Joi.number().min(0).max(100).required(),
        moisture: Joi.number().min(0).max(100).required()
    })
};

export const validateMaterial = (data) => {
    const schema = schemas[data.material];
    if (!schema) return { error: { details: [{ message: 'Invalid material type' }] } };
    return schema.validate(data, { stripUnknown: true });
};
