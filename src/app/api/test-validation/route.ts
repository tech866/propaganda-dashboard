import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/middleware/errors';
import { 
  validateCreateCall, 
  validateUpdateCall, 
  validateLogin, 
  validateRegister,
  validateCreateUser,
  validateMetricsFilter,
  validateCallFilter 
} from '@/lib/validation';

// POST /api/test-validation - Test validation schemas
const testValidation = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { schema, data } = body;

  if (!schema || !data) {
    return NextResponse.json({
      success: false,
      message: 'Schema and data are required',
      usage: {
        schema: 'One of: createCall, updateCall, login, register, createUser, metricsFilter, callFilter',
        data: 'The data to validate against the schema'
      }
    }, { status: 400 });
  }

  let validation;
  let schemaName;

  try {
    switch (schema) {
      case 'createCall':
        validation = await validateCreateCall(data);
        schemaName = 'Create Call';
        break;
      case 'updateCall':
        validation = await validateUpdateCall(data);
        schemaName = 'Update Call';
        break;
      case 'login':
        validation = await validateLogin(data);
        schemaName = 'Login';
        break;
      case 'register':
        validation = await validateRegister(data);
        schemaName = 'Register';
        break;
      case 'createUser':
        validation = await validateCreateUser(data);
        schemaName = 'Create User';
        break;
      case 'metricsFilter':
        validation = await validateMetricsFilter(data);
        schemaName = 'Metrics Filter';
        break;
      case 'callFilter':
        validation = await validateCallFilter(data);
        schemaName = 'Call Filter';
        break;
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid schema type',
          availableSchemas: ['createCall', 'updateCall', 'login', 'register', 'createUser', 'metricsFilter', 'callFilter']
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Validation test for ${schemaName} schema`,
      schema: schemaName,
      validation: {
        isValid: validation.isValid,
        data: validation.data,
        errors: validation.errors,
        errorMessage: validation.errorMessage
      },
      input: {
        schema,
        data
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Validation test failed',
      error: (error as Error).message,
      input: {
        schema,
        data
      }
    }, { status: 500 });
  }
});

export const POST = testValidation;
