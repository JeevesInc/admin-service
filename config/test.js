module.exports = {
  auth: {
    authServiceBaseHost: 'http://some-url',
    issuer: 'local-jeeves',
    audience: 'jeeves-backend-services',
    publicKeyBase64EncodedInput:
      'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQ0lqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FnOEFNSUlDQ2dLQ0FnRUFxTGlZKzVqRWVoWGxTdXhOV1B5QwpPY05CbzFnNnJqWkNsVDh6a0RCQlR1TS9kOVNNM0UranhocnRlMHYwNXl4emYrWmwvTjVhdjRQZzAzN0hsK0F5CnBMVWkvZDVHQWppQnM5b2pDdDhEZjRibWpnK2JRQlc0c01udkVlRXlmaG1HN3J2RnFaanpXTzhvbDZIcDc2M08KWWNDL3B5WmkyUk5FSEVEQVZrQW1GNUV4bnpjQWN3TjNHL1IzbGJZU3hzTS9UL1NRZWZhdkxBN0k1czNJUkRsdApRVHV1MktVNTFyMFo5eDMvSTRvdCtxVzJ1ZFZaRkhTaHRmYUdCTktOckpqdzJMS1FhS3kzSlY5ci8rVEJJcERLCk1DaHljM0dqREVtdlFwazhZM1NBOFp3WlNKZHFJMDZVdG8rSkdZclJUN1JDWWh3eXdCbkFIY3RLaHg3TXlWN0gKS09WVmtETjNYbmZDRHZCaU9vbERWbWR1K2w5NzBvRWNFZlM1eTk2ZUV5d0ZxMSttVmovRUcxY1Uwd1ZDZFNvaQpqc1Z0akVCWm1KK2ZFRUtJK0t4OHNqQURJNVBvUzJSWDRIVEJNd3BhZnkrd2xpUU5YVnZ6RUxwVFNBc2I1UG1iCkhOa1ZwQm84QWw3UW1MS09kUjhpQXU5am4rcWZ2T1RnTlZJNitwMGMzVG9qM3ZsL3liNzlISU9VY3NZdXNRL2IKMU9RSzJ5UWtEYVJjM0k0U21Ub2JzaHAxS2FiS092eEtlckJUZUZBQnRJNDBMaXlVT2VUOXBUOTVtb1lvUU1YagpxakNOTVBiVFlVY3BHZThGM0xNaHVmQ25scUthSVhnS0kxczhNZHp3NkJCMm5NSHlrNW0vOHAvQlVZSkNoTXJOCjcyRWNYWFhsL05CNDgzL3oydnpQeitzQ0F3RUFBUT09Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==',
    privateKeyBase64EncodedInput:
      'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlKS0FJQkFBS0NBZ0VBcUxpWSs1akVlaFhsU3V4TldQeUNPY05CbzFnNnJqWkNsVDh6a0RCQlR1TS9kOVNNCjNFK2p4aHJ0ZTB2MDV5eHpmK1psL041YXY0UGcwMzdIbCtBeXBMVWkvZDVHQWppQnM5b2pDdDhEZjRibWpnK2IKUUJXNHNNbnZFZUV5ZmhtRzdydkZxWmp6V084b2w2SHA3NjNPWWNDL3B5WmkyUk5FSEVEQVZrQW1GNUV4bnpjQQpjd04zRy9SM2xiWVN4c00vVC9TUWVmYXZMQTdJNXMzSVJEbHRRVHV1MktVNTFyMFo5eDMvSTRvdCtxVzJ1ZFZaCkZIU2h0ZmFHQk5LTnJKancyTEtRYUt5M0pWOXIvK1RCSXBES01DaHljM0dqREVtdlFwazhZM1NBOFp3WlNKZHEKSTA2VXRvK0pHWXJSVDdSQ1lod3l3Qm5BSGN0S2h4N015VjdIS09WVmtETjNYbmZDRHZCaU9vbERWbWR1K2w5Nwowb0VjRWZTNXk5NmVFeXdGcTErbVZqL0VHMWNVMHdWQ2RTb2lqc1Z0akVCWm1KK2ZFRUtJK0t4OHNqQURJNVBvClMyUlg0SFRCTXdwYWZ5K3dsaVFOWFZ2ekVMcFRTQXNiNVBtYkhOa1ZwQm84QWw3UW1MS09kUjhpQXU5am4rcWYKdk9UZ05WSTYrcDBjM1RvajN2bC95Yjc5SElPVWNzWXVzUS9iMU9RSzJ5UWtEYVJjM0k0U21Ub2JzaHAxS2FiSwpPdnhLZXJCVGVGQUJ0STQwTGl5VU9lVDlwVDk1bW9Zb1FNWGpxakNOTVBiVFlVY3BHZThGM0xNaHVmQ25scUthCklYZ0tJMXM4TWR6dzZCQjJuTUh5azVtLzhwL0JVWUpDaE1yTjcyRWNYWFhsL05CNDgzL3oydnpQeitzQ0F3RUEKQVFLQ0FnQUhjS3grVzh3K1BmendndDhlVDNSR3E4K1hMbXJZQjlpRDBGZXJ3aFQvTDVJNjdJcVJwSWxxVVFHcgo4RHVLZmpGUnNJMUt5MXRoR3FXdGJlZkxVTDJxK2JualRBdjJTUnVmSEwxeTIwYkNOdWF2MlF4VmxSK2gzQ1hJCnVnK0o5QUk1UU5xRWtoUVpGZUxLWFA5OTdFSXZtVnBhT3AwZFNYWTFjTDJLa0NXZDRHODV3Q2txNlRvMVoyQm0KbjdMUVJRZmp0THN5UmFpUDNzOEpMb1hvVEVmL0dteXBiUS9SNG1Ea3Z0UGpjMUozdlJzRHN0N013aC9uY0VtVQpxTnhLZ2l3TXdrTVArcDNRN2haTElJRkx6dXE3bU8wREhqMjhhdnRwaW14WlRtZnBQNkwxeW9lSnF3dHZ5WUNZCk9jRGxMT1BJZzhuUkl0R1Avc2o0a0dramNDU0VITWJQcU80N2JvZ3g1cGZqQmVkM1ZkaFFDR1pNZWREWEZ6U3cKK0xtd1FDSk1URE9pYjNyaEhYUmMrRDRpOE9TODd2Z3Raazd5RzJqZHlyUU1uZlpySTI4VWpabWovYS9EV0I0Lwp1a1ZRdGcwbi9pSldKWllMYUJsZ3dhUXpWY1ZFZXUyZjdSS0Z1R25kWThoc0t4bzUzTTJKZGNuT0wvcE1BK04wCnhHRGE1VWpjdGIyN3R5bDdxQUE5dFR3bzJaaFhyeXp6cmNTeDVWb2cxdTdJdGdzNGNoZm41b3VXV3hQbzJZRGYKOE05NksxQ29JR0pXSnAvTG5iMHRnbWtyNDZiTXZwMTZZOHJPM3B1M1doZy9jNDB4VVJQdTNNZCtETnJGMHJ4SQpZOFRyOGVhS2E0L1V2anhuLzlMK3BhQkxVSFNtcGZWSzZDZnZ3WG5sbWRaRnZkZmpNUUtDQVFFQTRFOXIrYkx0Ck55ckxIbXdlYjUyUHE3M1ptVFFETmdGRUdvWis0cllXMUw0L3BaLzVyTC9XVmpnbmFWL1ZYcExoZTJRME83YXgKTW83UkhjQlQ2VFg0cXpoUS8yb3MwTEIvekZRYnIxUGhuejczTytuaDdPYS81amlEdkxZQjVxVUk2VXdkS3J1SgpGVEJ4eXFiQkFxbGtrdm1oVHF4bWlNd2FVZUxjZkxIMjVSVWtxcmRMRXpNY0VmYmpYa2JZaFVORmhZSlptQUpEClM2d2F6VWI4Y3UyZWxlQUdkblVVS0Jpa005WXp1a1FCWWFDUXpQN3RzTEtjQzlockx6dHltTFg3eC9aTk9SVEUKSUU0TEpSQ1VRd0pvMXJaRlF0TW5YUFNDYW1vOUJqMjVJazNmdmFxUEJxRXA1d1Vtcjk3Q1U4aWl3alQrSmRldwp2aEYvNEM3Z1AwTVNyd0tDQVFFQXdJNngrb2VrdlN0VnBNM0FLOW9iVFA4WEpRaDhNYWRrRlFtbTIyMU5mMFRtCi9OSTRLRCtRK2YrMkFnS1Y5Y0VlNEZsamZadWFnWWN4aWsvZy96NGZrOVRzQi94TG9yd0RxSFpSUGVENFU5MnYKbjNrRzNoeTBORHYvWTJWRTN0SnlLM3RTbkY5emlSWW80c2kwVkpqRzF4QlR0UDdhNVlPS21PMlZ1ZCsyMXgzSgpmWVBOeUk5M01FQmwvd2wvemYxQWt4Z2IrQ3NJV1dXZmQzdStYWmpjcUlQMEJnay9DbzlpMmVEaDd1ZkhINUlSCjJxdVNvVUM5UFhyNy83Tmd5MUxac0NTMU5rbEdDaHA4U3Nwekp1V3BlMFY1dEVDZFBlbWgzcjE3cDZLN2hreC8KTFltMzIzcGJOdmJFTUk2TXQ5MkVYM3djdjVmMTJJQ3d4TTdDdnkxVmhRS0NBUUJnVnp4VS90aUx2VUdJUzMrMwpDTUZRVGpaTGF0K0dMbjBGdDRaLzhSMVZPbkV6dmNZS3dFcGF0YnVYc3FWOS9UQURRMEo3OHplZ00xNzFuRWx0Ci9OUlZGZGNVSEpJcS8rT2o2dXdKSGNubUQ3RTRkbmVtdkdUbmlKWnNVdS8yRkNRRHI4RkhQVXpmWVBNK3l1aFQKTUZZV0drbUI5T0lGRjBTbXJ2MXNRVE45cU5zYXg2YmpGQ3lXT3FmbE1pQ0UvQ083K0FSckdXMjE3ckdFUVZ6awpMOUxSSkdzaUxaNytxYmE4M045U3ZTcXF0Ny81aS9TaTA5UFo4cFgycjEzRTRVVEcyYTdKT1hZVE9mSG5kWHQ0ClhHeVM2NjVMeVUwNnkzbklJdUVhOFIrMjhDT00zdGlYVEZrbTlEdHRoZ3VJMkwrdkVmdW1YVUY0SVNQL01hTDMKQ09QWkFvSUJBUUNaNS9QOWlMbDFzZE5NWEYvRExSc3hHWnJJTU5ZRFlnV3VndjVvMkI1ZklSVjI4aGVNby9JZQp2L0liL1RFYk1uYVpYeGtVWm5EQ0l1ckg0RHk0QmxGNitXNkdtM05nNk9JTG5qWWxQVkYreHV2K2pOK2VYRmIwCmdSZ0p2QUdtRDVMTmlrNW5TaXV3WUpQaFlBWXlyOElPVjdCd05GdUZvdlArYzdkK3ozNzJ4WW9zMWxKK2daMEUKWmhTZ0dsbWFyVmNWdXVsd0hBVWFYdzFzbE8xOUpoY0lZaCtEUzVTbHZpR0dnQ1pWcTlBT1BkUWpjWXRMYzlGTgorS1MrcGdNeHdGRGFaeHluL1QwTUNrdGFCQ0t4N2xMZWdwTmFMV01BLzJJd0JFZDNuNncvRlpsNUxtQlQvcUkxCmRsc3RiR0t3KzA4NGVwMEh6ay9qOGtoWHBlTW1wdmQ1QW9JQkFCdGx5d0c1aVR2U0Z5SlpTd1dtUkJ6NGZQVE0KYzROOFhmNmhXeDFmSDhYSjRybHZIQS9ESVQ1TlZCTThYSjN5S3IyZCtudHUxNU9NS1crWkhXVlhOWERtcjNoVApGZnU2SnUrR29qRmQ5RE9pb0xVYnRnb21oVFIwOFVYU3E3UHRVa3JoRzlaYlZicXJqMWJ1RVhCbnRSc3ZZR3NyCmxNRml2R2w4QTc1RklKM1ZBNXYyQ3ZwUGhmVDZoaTg4cGpsTG5VZ00vbG80dVZyNUd2S1RRUXhhV1o1V3JpZ1oKbUJIVzBlckNUL1FPRTVvNnFwUllkWmdwTHlmVGFvaTExVjRka2N2MHNVZ2xrV1M2eGdqalhYdk9oYXRZNFpURQpCVkFnMy9yVXlMWlltNTZKN1RPQUYyQ2xtQ3FMeHpZN0Q2aENLaEM3OU5jTklJN1M2dE4xYTduRFI5TT0KLS0tLS1FTkQgUlNBIFBSSVZBVEUgS0VZLS0tLS0=',
  },
  log: {
    enabled: false,
    level: 'silent',
  },
  aws: {
    AWS_ENDPOINT: 'aws-endpoint',
    AWS_DEFAULT_REGION: 'aws-default-region',
  },
  mq: {
    EXAMPLE_PROCESS_QUEUE_URL: 'example-process-queue-url',
    EXAMPLE_PROCESS_DEAD_LETTER_QUEUE_URL: 'example-process-dead-letter-queue-url',
  },
};