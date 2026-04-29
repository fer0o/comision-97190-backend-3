import { describe, it } from 'mocha';
import { expect } from 'chai';
import supertest from 'supertest';
import app from '../../src/app.js';

const requester = supertest(app);

describe('Health router', () => {
  it('GET /api/health returns service status', async () => {
    const { status, body } = await requester.get('/api/health');

    expect(status).to.equal(200);
    expect(body).to.have.property('status', 'success');
    expect(body.payload).to.have.property('service', 'AdoptMe API');
    expect(body.payload).to.have.property('timestamp');
  });
});
