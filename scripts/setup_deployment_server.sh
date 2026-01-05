#!/bin/bash
# =============================================================================
# Setup Deployment Server Script
# =============================================================================
# Prepares a fresh server (Ubuntu 22.04) for BVS deployment
# Installs Docker, Docker Compose, and configures deployment user
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Configuration
DEPLOY_USER="deploy"
DEPLOY_PATH="/var/www/bvs"
ENVIRONMENT="${1:-staging}"  # staging or production

clear
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║         BVS Deployment Server Setup - $ENVIRONMENT                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# =============================================================================
# STEP 1: System Update
# =============================================================================

log_info "Step 1: Updating system packages..."

sudo apt-get update
sudo apt-get upgrade -y

log_success "System updated"

# =============================================================================
# STEP 2: Install Docker
# =============================================================================

log_info "Step 2: Installing Docker..."

# Remove old versions
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install dependencies
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version

log_success "Docker installed"

# =============================================================================
# STEP 3: Create Deployment User
# =============================================================================

log_info "Step 3: Creating deployment user..."

# Create deploy user if doesn't exist
if id "$DEPLOY_USER" &>/dev/null; then
    log_warning "User $DEPLOY_USER already exists"
else
    sudo useradd -m -s /bin/bash $DEPLOY_USER
    log_success "User $DEPLOY_USER created"
fi

# Add to docker group
sudo usermod -aG docker $DEPLOY_USER

# Create deployment directory
sudo mkdir -p $DEPLOY_PATH
sudo chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH

log_success "Deployment user configured"

# =============================================================================
# STEP 4: Setup SSH for Deployment
# =============================================================================

log_info "Step 4: Setting up SSH for deployment..."

# Create .ssh directory for deploy user
sudo -u $DEPLOY_USER mkdir -p /home/$DEPLOY_USER/.ssh
sudo -u $DEPLOY_USER chmod 700 /home/$DEPLOY_USER/.ssh

# Create authorized_keys file
sudo -u $DEPLOY_USER touch /home/$DEPLOY_USER/.ssh/authorized_keys
sudo -u $DEPLOY_USER chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys

log_success "SSH directory created"
log_info "Add your GitHub Actions public key to: /home/$DEPLOY_USER/.ssh/authorized_keys"

# =============================================================================
# STEP 5: Install Additional Tools
# =============================================================================

log_info "Step 5: Installing additional tools..."

sudo apt-get install -y \
    git \
    curl \
    wget \
    htop \
    vim \
    unzip \
    postgresql-client

log_success "Additional tools installed"

# =============================================================================
# STEP 6: Configure Firewall
# =============================================================================

log_info "Step 6: Configuring firewall..."

# Install ufw if not present
sudo apt-get install -y ufw

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Enable firewall
echo "y" | sudo ufw enable

log_success "Firewall configured"

# =============================================================================
# STEP 7: Clone Repository
# =============================================================================

log_info "Step 7: Cloning repository..."

# Switch to deploy user and clone repo
sudo -u $DEPLOY_USER bash << EOF
cd ~
if [ -d "$DEPLOY_PATH/.git" ]; then
    echo "Repository already cloned"
else
    echo "Enter your GitHub repository URL:"
    read REPO_URL
    git clone \$REPO_URL $DEPLOY_PATH
fi
EOF

log_success "Repository setup complete"

# =============================================================================
# STEP 8: Create Environment Files
# =============================================================================

log_info "Step 8: Creating environment files..."

# Create backend .env
sudo -u $DEPLOY_USER tee $DEPLOY_PATH/backend/.env > /dev/null << EOF
# Django Settings
DEBUG=False
SECRET_KEY=CHANGE_THIS_TO_RANDOM_STRING
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
POSTGRES_DB=bvs_db
POSTGRES_USER=bvs_user
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
DATABASE_URL=postgresql://bvs_user:CHANGE_THIS_PASSWORD@db:5432/bvs_db

# Redis
REDIS_URL=redis://redis:6379/0

# CORS
CORS_ALLOWED_ORIGINS=https://your-domain.com

# Email (SendGrid example)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=YOUR_SENDGRID_API_KEY

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# Environment
ENVIRONMENT=$ENVIRONMENT
EOF

# Create frontend .env
sudo -u $DEPLOY_USER tee $DEPLOY_PATH/frontend/.env.local > /dev/null << EOF
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
EOF

log_success "Environment files created"
log_warning "IMPORTANT: Edit $DEPLOY_PATH/backend/.env and $DEPLOY_PATH/frontend/.env.local with real values!"

# =============================================================================
# STEP 9: Create Necessary Directories
# =============================================================================

log_info "Step 9: Creating necessary directories..."

sudo -u $DEPLOY_USER mkdir -p $DEPLOY_PATH/backend/logs
sudo -u $DEPLOY_USER mkdir -p $DEPLOY_PATH/backend/media
sudo -u $DEPLOY_USER mkdir -p $DEPLOY_PATH/backend/static_root
sudo -u $DEPLOY_USER mkdir -p $DEPLOY_PATH/backups
sudo -u $DEPLOY_USER chmod 755 $DEPLOY_PATH/backend/logs
sudo -u $DEPLOY_USER chmod 755 $DEPLOY_PATH/backend/media
sudo -u $DEPLOY_USER chmod 755 $DEPLOY_PATH/backups

log_success "Directories created"

# =============================================================================
# STEP 10: Setup SSL (Let's Encrypt)
# =============================================================================

log_info "Step 10: Installing Certbot for SSL..."

sudo apt-get install -y certbot python3-certbot-nginx

log_success "Certbot installed"
log_info "Run this command to get SSL certificate (after DNS is configured):"
log_info "sudo certbot --nginx -d your-domain.com -d www.your-domain.com"

# =============================================================================
# STEP 11: Setup Automatic Backups
# =============================================================================

log_info "Step 11: Setting up automatic backups..."

# Create backup script
sudo -u $DEPLOY_USER tee $DEPLOY_PATH/scripts/backup_production.sh > /dev/null << 'EOF'
#!/bin/bash
cd /var/www/bvs
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).sql.gz"
docker compose exec -T db pg_dump -U bvs_user bvs_db | gzip > "backups/$BACKUP_NAME"
find backups/ -name "backup-*.sql.gz" -mtime +7 -delete
echo "Backup created: $BACKUP_NAME"
EOF

sudo chmod +x $DEPLOY_PATH/scripts/backup_production.sh

# Add to crontab
(sudo -u $DEPLOY_USER crontab -l 2>/dev/null; echo "0 2 * * * $DEPLOY_PATH/scripts/backup_production.sh") | sudo -u $DEPLOY_USER crontab -

log_success "Automatic backups configured (daily at 2 AM)"

# =============================================================================
# STEP 12: System Resource Limits
# =============================================================================

log_info "Step 12: Configuring system resource limits..."

# Increase file descriptor limits for Docker
sudo tee -a /etc/security/limits.conf > /dev/null << EOF
* soft nofile 65536
* hard nofile 65536
EOF

# Increase vm.max_map_count for Elasticsearch/Meilisearch
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf

log_success "System limits configured"

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                     SERVER SETUP COMPLETE                             ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

log_success "Server is ready for deployment!"
echo ""
log_info "Next steps:"
echo "  1. Add GitHub Actions public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "  2. Edit $DEPLOY_PATH/backend/.env with real credentials"
echo "  3. Edit $DEPLOY_PATH/frontend/.env.local with real values"
echo "  4. Configure DNS to point to this server"
echo "  5. Run: sudo certbot --nginx -d your-domain.com"
echo "  6. Start services: cd $DEPLOY_PATH && docker compose up -d"
echo ""
log_info "Deployment path: $DEPLOY_PATH"
log_info "Deploy user: $DEPLOY_USER"
log_info "Environment: $ENVIRONMENT"
echo ""
log_info "Test SSH access:"
echo "  ssh $DEPLOY_USER@your-server-ip"
echo ""
