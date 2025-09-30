# Meta Tables

| Table Name | Purpose | Notes |
|------------|---------|-------|
| agencies | Store agency organization information | Primary tenant entity |
| clients | Store client business information | Belongs to one agency |
| leads | Store potential client information | Can convert to client |
| sales_calls | Store individual call interactions | Links to client and campaign |
| campaigns | Store campaign grouping information | Groups calls and financial records |
| performance_metrics | Store calculated performance values | Aggregated from sales calls |
| financial_records | Store ad spend and payment entries | Links to campaigns and integrations |
| integration_sources | Store external system connections | Meta, Whop, Stripe integrations |
| roles | Store access permission definitions | System and custom roles |
| custom_stages | Store agency-defined pipeline stages | Customizable workflow stages |
| user_feedback | Store ratings and comments | Links to calls and clients |
| report_templates | Store saved dashboard configurations | Reusable report definitions |
| users | Store user account information | Links to roles and agencies |
| agency_stages | Junction table for agency custom stages | Many-to-many relationship |
| campaign_calls | Junction table for campaign call grouping | Many-to-many relationship |
| template_metrics | Junction table for report template metrics | Many-to-many relationship |
| template_financials | Junction table for report template financials | Many-to-many relationship |

# Meta Fields

| Table | Field Name | Data Type | Purpose | Notes |
|-------|------------|-----------|---------|-------|
| agencies | id | uuid | Primary key | Auto-generated |
| agencies | name | string | Agency name | Required |
| agencies | registration_date | datetime | When agency joined | Fixed attribute |
| agencies | subscription_plan | enum | Service tier | Fixed attribute |
| agencies | contact_info | json | Contact details | Variable property |
| agencies | billing_address | string | Billing location | Variable property |
| agencies | active_status | boolean | Is agency active | Variable property |
| clients | id | uuid | Primary key | Auto-generated |
| clients | agency_id | uuid | Foreign key to agencies | Required |
| clients | name | string | Client name | Required |
| clients | onboarding_date | datetime | Relationship start | Fixed attribute |
| clients | contact_info | json | Contact details | Fixed attribute |
| clients | industry | string | Business classification | Variable property |
| clients | account_status | enum | Active/inactive status | Variable property |
| clients | billing_info | json | Payment information | Variable property |
| leads | id | uuid | Primary key | Auto-generated |
| leads | agency_id | uuid | Foreign key to agencies | Required |
| leads | name | string | Lead name | Required |
| leads | lead_source | string | How lead was acquired | Fixed attribute |
| leads | initial_contact_date | datetime | First contact | Fixed attribute |
| leads | contact_info | json | Contact details | Variable property |
| leads | qualification_status | enum | Lead qualification level | Variable property |
| leads | conversion_probability | decimal | Likelihood to convert | Variable property |
| sales_calls | id | uuid | Primary key | Auto-generated |
| sales_calls | client_id | uuid | Foreign key to clients | Required |
| sales_calls | campaign_id | uuid | Foreign key to campaigns | Optional |
| sales_calls | scheduled_date_time | datetime | Planned meeting time | Fixed attribute |
| sales_calls | duration | integer | Call length in minutes | Fixed attribute |
| sales_calls | call_outcome | enum | Scheduled/Completed/No-Show/Closed | Variable property |
| sales_calls | notes | text | Call comments | Variable property |
| sales_calls | follow_up_actions | text | Next steps | Variable property |
| sales_calls | attendee_list | json | Meeting participants | Variable property |
| campaigns | id | uuid | Primary key | Auto-generated |
| campaigns | agency_id | uuid | Foreign key to agencies | Required |
| campaigns | name | string | Campaign name | Required |
| campaigns | start_date | datetime | Campaign launch | Fixed attribute |
| campaigns | end_date | datetime | Campaign conclusion | Fixed attribute |
| campaigns | campaign_status | enum | Active/Paused/Completed | Variable property |
| campaigns | budget_allocation | decimal | Total budget | Variable property |
| campaigns | target_metrics | json | Goal metrics | Variable property |
| performance_metrics | id | uuid | Primary key | Auto-generated |
| performance_metrics | campaign_id | uuid | Foreign key to campaigns | Required |
| performance_metrics | calculation_method | string | Formula used | Fixed attribute |
| performance_metrics | metric_type | enum | Show Rate/Close Rate/ROI | Fixed attribute |
| performance_metrics | calculated_value | decimal | Computed result | Variable property |
| performance_metrics | time_period | string | Calculation period | Variable property |
| performance_metrics | comparison_baseline | decimal | Previous value | Variable property |
| performance_metrics | trend_direction | enum | Up/Down/Stable | Variable property |
| financial_records | id | uuid | Primary key | Auto-generated |
| financial_records | campaign_id | uuid | Foreign key to campaigns | Required |
| financial_records | integration_source_id | uuid | Foreign key to integration_sources | Required |
| financial_records | transaction_date | datetime | When transaction occurred | Fixed attribute |
| financial_records | amount | decimal | Transaction value | Fixed attribute |
| financial_records | payment_status | enum | Pending/Paid/Failed | Variable property |
| financial_records | transaction_type | enum | Ad Spend/Payment/Refund | Variable property |
| financial_records | currency | string | Currency code | Variable property |
| financial_records | reference_number | string | External reference | Variable property |
| integration_sources | id | uuid | Primary key | Auto-generated |
| integration_sources | agency_id | uuid | Foreign key to agencies | Required |
| integration_sources | provider_name | string | Meta/Whop/Stripe | Fixed attribute |
| integration_sources | connection_id | string | External system ID | Fixed attribute |
| integration_sources | data_sync_status | enum | Up to date/Delayed/Failed | Variable property |
| integration_sources | last_sync_time | datetime | Last successful sync | Variable property |
| integration_sources | authentication_status | enum | Connected/Disconnected | Variable property |
| integration_sources | api_version | string | Integration API version | Variable property |
| roles | id | uuid | Primary key | Auto-generated |
| roles | role_type | enum | Admin/Agency User/Client User | Fixed attribute |
| roles | permissions | json | Access rights | Fixed attribute |
| roles | name | string | Role display name | Variable property |
| roles | description | text | Role purpose | Variable property |
| roles | active_status | boolean | Is role active | Variable property |
| custom_stages | id | uuid | Primary key | Auto-generated |
| custom_stages | agency_id | uuid | Foreign key to agencies | Required |
| custom_stages | stage_order | integer | Pipeline sequence | Fixed attribute |
| custom_stages | stage_name | string | Stage display name | Variable property |
| custom_stages | stage_description | text | Stage purpose | Variable property |
| custom_stages | completion_criteria | text | Stage requirements | Variable property |
| custom_stages | active_status | boolean | Is stage active | Variable property |
| user_feedback | id | uuid | Primary key | Auto-generated |
| user_feedback | client_id | uuid | Foreign key to clients | Required |
| user_feedback | sales_call_id | uuid | Foreign key to sales_calls | Optional |
| user_feedback | feedback_date | datetime | When feedback given | Fixed attribute |
| user_feedback | feedback_type | enum | Rating/Comment/Complaint | Fixed attribute |
| user_feedback | rating_score | integer | Numeric rating | Variable property |
| user_feedback | comments | text | Feedback text | Variable property |
| user_feedback | feedback_status | enum | New/Reviewed/Resolved | Variable property |
| user_feedback | response_actions | text | Actions taken | Variable property |
| report_templates | id | uuid | Primary key | Auto-generated |
| report_templates | agency_id | uuid | Foreign key to agencies | Required |
| report_templates | template_type | enum | Dashboard/Export/Recurring | Fixed attribute |
| report_templates | template_name | string | Template display name | Variable property |
| report_templates | configuration_settings | json | Template configuration | Variable property |
| report_templates | schedule_frequency | enum | Daily/Weekly/Monthly | Variable property |
| report_templates | active_status | boolean | Is template active | Variable property |
| users | id | uuid | Primary key | Auto-generated |
| users | agency_id | uuid | Foreign key to agencies | Required |
| users | role_id | uuid | Foreign key to roles | Required |
| users | email | string | User email address | Required |
| users | name | string | User display name | Required |
| users | created_at | datetime | Account creation | Auto-generated |
| users | last_login | datetime | Last login time | Variable property |
| users | active_status | boolean | Is user active | Variable property |

# Meta References

| From Table | To Table | Relationship Type | Join Key | Notes |
|------------|----------|-------------------|----------|-------|
| clients | agencies | Many-to-One | agency_id | Client belongs to one agency |
| leads | agencies | Many-to-One | agency_id | Lead belongs to one agency |
| sales_calls | clients | Many-to-One | client_id | Call belongs to one client |
| sales_calls | campaigns | Many-to-One | campaign_id | Call can belong to one campaign |
| campaigns | agencies | Many-to-One | agency_id | Campaign belongs to one agency |
| performance_metrics | campaigns | Many-to-One | campaign_id | Metric belongs to one campaign |
| financial_records | campaigns | Many-to-One | campaign_id | Record belongs to one campaign |
| financial_records | integration_sources | Many-to-One | integration_source_id | Record from one integration |
| integration_sources | agencies | Many-to-One | agency_id | Integration belongs to one agency |
| custom_stages | agencies | Many-to-One | agency_id | Stage belongs to one agency |
| user_feedback | clients | Many-to-One | client_id | Feedback from one client |
| user_feedback | sales_calls | Many-to-One | sales_call_id | Feedback for one call |
| report_templates | agencies | Many-to-One | agency_id | Template belongs to one agency |
| users | agencies | Many-to-One | agency_id | User belongs to one agency |
| users | roles | Many-to-One | role_id | User has one role |
| leads | clients | One-to-One | converted_client_id | Lead can convert to one client |
| agencies | custom_stages | One-to-Many | agency_id | Agency can have many stages |
| campaigns | sales_calls | One-to-Many | campaign_id | Campaign can have many calls |
| campaigns | financial_records | One-to-Many | campaign_id | Campaign can have many records |
| report_templates | performance_metrics | Many-to-Many | template_metrics | Template can include many metrics |
| report_templates | financial_records | Many-to-Many | template_financials | Template can include many records |
